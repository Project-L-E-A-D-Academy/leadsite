export default function Badge({ text }: { text: string }) {
  return (
    <span className="bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow">{text}</span>
  );
}