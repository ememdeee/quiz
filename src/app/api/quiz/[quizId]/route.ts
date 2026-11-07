import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ quizId: string }> }
) {
    try {
        const { quizId } = await params;

        if (!quizId) {
            return NextResponse.json(
                { error: 'Quiz ID is required' },
                { status: 400 }
            );
        }

        // Path to the quizzes directory in public folder
        const quizzesDir = path.join(process.cwd(), 'public', 'data', 'quizzes');
        const quizPath = path.join(quizzesDir, `${quizId}.json`);
        const indexPath = path.join(quizzesDir, 'index.json');

        // Check if quiz file exists
        try {
            await fs.access(quizPath);
        } catch {
            return NextResponse.json(
                { error: 'Quiz not found' },
                { status: 404 }
            );
        }

        // Delete the quiz file
        await fs.unlink(quizPath);

        // Update index.json to remove the quiz entry
        try {
            const indexContent = await fs.readFile(indexPath, 'utf-8');
            const quizList = JSON.parse(indexContent);
            const updatedList = quizList.filter((q: { quizId: string }) => q.quizId !== quizId);
            await fs.writeFile(indexPath, JSON.stringify(updatedList, null, 2), 'utf-8');
        } catch {
            // Index file might not exist, that's okay
        }

        return NextResponse.json({ success: true, quizId });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete quiz' },
            { status: 500 }
        );
    }
}
