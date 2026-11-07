import type { UserProfile } from '@/store/userProfileStore';

// =============================================================================
// BMI — Body Mass Index (standard formula)
// =============================================================================

export function calculateBMI(weightKg: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return +(weightKg / (heightM * heightM)).toFixed(1);
}

export function getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

// =============================================================================
// BMR — Basal Metabolic Rate (Mifflin-St Jeor, gold standard)
// =============================================================================

export function calculateBMR(
    weightKg: number,
    heightCm: number,
    age: number,
    gender: 'male' | 'female'
): number {
    if (gender === 'male') {
        return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    }
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

// =============================================================================
// Lifestyle Penalty Score (from quiz answers)
// =============================================================================

export function lifestylePenalty(profile: Partial<UserProfile>): number {
    let score = 0;

    // Sleep penalties
    if (profile.sleep === 'under-5') score += 4;
    else if (profile.sleep === 'around-6') score += 2;

    // Activity penalties
    if (profile.activity === 'couch-potato') score += 5;
    else if (profile.activity === 'light') score += 2;

    // Typical day penalties
    if (profile.typicalDay === 'sitting') score += 3;

    // Walk frequency penalties
    if (profile.walkFrequency === 'once-a-week') score += 2;
    else if (profile.walkFrequency === 'drive') score += 4;

    return score;
}

// =============================================================================
// Metabolic Age (estimated — NOT a medical diagnostic)
// =============================================================================

export function calculateMetabolicAge(
    age: number,
    bmr: number,
    gender: 'male' | 'female',
    lifestyleScore: number
): number {
    const baseline = gender === 'male' ? 1700 : 1500;
    const metabolicAge = age * (baseline / bmr);
    return Math.round(metabolicAge + lifestyleScore * 0.8);
}

// =============================================================================
// TDEE — Total Daily Energy Expenditure
// =============================================================================

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
    'couch-potato': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'high': 1.725,
};

export function calculateTDEE(bmr: number, activity: string | null): number {
    const multiplier = ACTIVITY_MULTIPLIERS[activity || ''] || 1.2;
    return Math.round(bmr * multiplier);
}

// =============================================================================
// Hydration Status (from water answer)
// =============================================================================

export function hydrationStatus(answer: string | null): { label: string; score: number } {
    switch (answer) {
        case 'coffee-tea':
            return { label: 'Very Low', score: 1 };
        case '2-cups':
            return { label: 'Low', score: 2 };
        case '2-6-cups':
            return { label: 'Moderate', score: 3 };
        case 'over-8':
            return { label: 'Optimal', score: 4 };
        default:
            return { label: 'Unknown', score: 0 };
    }
}

// =============================================================================
// Weight Projection (safe fat loss: ~0.8% body weight/week)
// =============================================================================

export interface WeightProjectionPoint {
    name: string;
    weight: number;
}

export function projectedWeight(
    weightKg: number,
    targetWeightKg?: number | null,
    targetDate?: string | null
): WeightProjectionPoint[] {
    const dailyLoss = (weightKg * 0.008) / 7; // safe max ~0.8% body weight/week, expressed per-day
    const now = new Date();

    // Calculate total days from target date, default to 84 days (12 weeks)
    let totalDays = 84;
    if (targetDate) {
        const target = new Date(targetDate + 'T00:00:00');
        const diffMs = target.getTime() - now.getTime();
        totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    // Endpoint: use the user's target if it's achievable within the safe-rate
    // budget, otherwise cap at the safe-rate projection so the chart stays
    // realistic (we never claim faster loss than 0.8%/wk).
    const safeFinal = +(weightKg - dailyLoss * totalDays).toFixed(1);
    const endpoint = targetWeightKg && targetWeightKg > safeFinal
        ? targetWeightKg
        : safeFinal;

    // Pick label granularity so x-axis ticks stay distinct.
    // Sub-week → days, sub-2-month → weeks, otherwise months.
    const unitDays = totalDays < 7 ? 1 : totalDays < 60 ? 7 : 30;
    const totalUnits = Math.max(1, Math.round(totalDays / unitDays));

    // Plot up to 5 points along an exponential-decay curve from start → endpoint.
    // Loss is steepest early and gradually flattens as the goal approaches —
    // matches how real weight loss tends to plateau, and (critically) keeps
    // the curve monotonically decreasing instead of dipping below the goal.
    //   weight(t) = endpoint + (start − endpoint) · ((e^(−k·t) − e^(−k)) / (1 − e^(−k)))
    //   At t=0 → start exactly. At t=1 → endpoint exactly.
    // For very short timelines (e.g. 1 day) we collapse STEPS so the x-axis
    // doesn't repeat the same label.
    const STEPS = Math.min(4, totalUnits);
    const k = 2.5;         // decay strength — higher = more front-loaded loss
    const drop = weightKg - endpoint;
    const denom = 1 - Math.exp(-k);

    const points: WeightProjectionPoint[] = [];
    const seen = new Set<string>();
    for (let i = 0; i <= STEPS; i++) {
        const t = STEPS === 0 ? 1 : i / STEPS;
        const decayed = (Math.exp(-k * t) - Math.exp(-k)) / denom;
        const weight = +(endpoint + drop * decayed).toFixed(1);
        const days = Math.round(totalDays * t);
        const name = i === 0 ? 'Now' : getTimelineLabel(days);
        if (seen.has(name)) continue;
        seen.add(name);
        points.push({ name, weight });
    }
    return points;
}

/**
 * Returns a human-readable timeline label like "1 Day", "3 Days", "1 Week", "3 Months"
 */
export function getTimelineLabel(days: number): string {
    if (days < 7) {
        return days === 1 ? '1 Day' : `${days} Days`;
    }
    const weeks = Math.round(days / 7);
    if (weeks < 4) {
        return weeks === 1 ? '1 Week' : `${weeks} Weeks`;
    }
    const months = Math.round(days / 30);
    if (months >= 12) {
        const years = Math.round(months / 12);
        return years === 1 ? '1 Year' : `${years} Years`;
    }
    return months === 1 ? '1 Month' : `${months} Months`;
}

// =============================================================================
// Goal Label (from quiz main-goal answer)
// =============================================================================

export function getGoalLabel(goal?: string | null): string {
    switch (goal) {
        case 'lose-weight':
            return 'Lose weight';
        case 'get-fit':
            return 'Get fit';
        case 'eat-healthier':
            return 'Eat healthier';
        default:
            return 'Improve health';
    }
}

// =============================================================================
// Body Fat Estimation (Deurenberg formula — research-backed proxy)
// NOT a medical diagnostic.
// =============================================================================

export function estimateBodyFat(
    bmi: number,
    age: number,
    gender: 'male' | 'female'
): number {
    const sex = gender === 'male' ? 1 : 0;
    const bf = (1.2 * bmi) + (0.23 * age) - (10.8 * sex) - 5.4;
    return Math.round(Math.max(8, Math.min(45, bf)));
}

export function getBodyFatLabel(bodyFatPercent: number): string {
    if (bodyFatPercent >= 32) return 'High';
    if (bodyFatPercent >= 25) return 'Above Avg';
    if (bodyFatPercent >= 18) return 'Normal';
    return 'Low';
}

// =============================================================================
// Unified Health Insights Builder
// =============================================================================

export interface HealthInsights {
    bmi: number;
    bmiCategory: string;
    bmr: number;
    metabolicAge: number;
    dailyBurn: number;       // TDEE
    weightProjection: WeightProjectionPoint[];
    projectedLossKg: number;
    projectedLossPercent: number;
    timelineLabel: string;   // e.g. "3 Months", "6 Months"
}

export function buildHealthInsights(profile: UserProfile): HealthInsights | null {
    const { gender, age, heightCm, weightKg, targetWeightKg, activity } = profile;

    // Require minimum data
    if (!gender || !age || !heightCm || !weightKg) return null;

    const bmi = calculateBMI(weightKg, heightCm);
    const bmiCategory = getBMICategory(bmi);

    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const lifestyle = lifestylePenalty(profile);
    const metabolicAge = calculateMetabolicAge(age, bmr, gender, lifestyle);

    const dailyBurn = calculateTDEE(bmr, activity);

    const weightProjection = projectedWeight(weightKg, targetWeightKg, profile.targetDate);
    const finalWeight = weightProjection[weightProjection.length - 1].weight;
    const projectedLossKg = +(weightKg - finalWeight).toFixed(1);
    const projectedLossPercent = Math.round((projectedLossKg / weightKg) * 100);

    // Timeline label from the last chart data point
    const timelineLabel = weightProjection[weightProjection.length - 1].name;

    return {
        bmi,
        bmiCategory,
        bmr,
        metabolicAge,
        dailyBurn,
        weightProjection,
        projectedLossKg,
        projectedLossPercent,
        timelineLabel,
    };
}
