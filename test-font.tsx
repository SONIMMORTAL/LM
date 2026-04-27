import { Nanum_Brush_Script } from 'next/font/google';
const nanum = Nanum_Brush_Script({ weight: '400', subsets: ['latin'] });
export default function Test() { return <div className={nanum.className}>Test</div>; }
