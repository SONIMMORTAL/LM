import { NextResponse } from 'next/server';
import { getPrintfulProduct } from '@/lib/printful';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr, 10);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const product = await getPrintfulProduct(id);
        if (!product) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('API products route error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
