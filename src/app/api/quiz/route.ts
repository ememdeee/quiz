import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const quiz = await request.json();

        if (!quiz.quizId) {
            return NextResponse.json(
                { error: 'Quiz ID is required' },
                { status: 400 }
            );
        }

        // Path to the quizzes directory in public folder
        const quizzesDir = path.join(process.cwd(), 'public', 'data', 'quizzes');
        const quizPath = path.join(quizzesDir, `${quiz.quizId}.json`);

        // Ensure directory exists
        await fs.mkdir(quizzesDir, { recursive: true });

        // Write the quiz JSON file
        await fs.writeFile(quizPath, JSON.stringify(quiz, null, 2), 'utf-8');

        // Update the index.json file
        const indexPath = path.join(quizzesDir, 'index.json');
        let quizList: Array<{
            quizId: string;
            title: string;
            description: string;
            status: 'published' | 'draft';
            stepsCount: number;
            thumbnailUrl?: string;
            updatedAt: string;
        }> = [];

        try {
            const indexContent = await fs.readFile(indexPath, 'utf-8');
            quizList = JSON.parse(indexContent);
        } catch {
            // Index doesn't exist yet, start with empty array
        }

        // Update or add quiz entry in index
        const existingIndex = quizList.findIndex(q => q.quizId === quiz.quizId);
        const quizStatus = quiz.meta.status === 'published' ? 'published' : 'draft';
        const quizEntry = {
            quizId: quiz.quizId,
            title: quiz.meta.title,
            description: quiz.meta.description || '',
            status: quizStatus as 'published' | 'draft',
            stepsCount: quiz.steps.length,
            thumbnailUrl: quiz.meta.thumbnailUrl,
            updatedAt: quiz.meta.updatedAt || new Date().toISOString(),
            createdAt: quiz.meta.createdAt || new Date().toISOString(),
        };

        if (existingIndex !== -1) {
            quizList[existingIndex] = quizEntry;
        } else {
            quizList.push(quizEntry);
        }

        // Write updated index
        await fs.writeFile(indexPath, JSON.stringify(quizList, null, 2), 'utf-8');

        return NextResponse.json({ success: true, quizId: quiz.quizId });
    } catch (error) {
        console.error('Error saving quiz:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to save quiz' },
            { status: 500 }
        );
    }
}
