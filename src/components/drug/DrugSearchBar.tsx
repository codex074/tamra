import { Search } from 'lucide-react';

interface DrugSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function DrugSearchBar({ value, onChange }: DrugSearchBarProps): JSX.Element {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
      <input
        className="w-full rounded-[20px] border border-line bg-white py-3.5 pl-11 pr-4 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
        onChange={(event) => onChange(event.target.value)}
        placeholder="ค้นหาชื่อยา ชื่อการค้า กลุ่มยา หรือข้อบ่งใช้"
        value={value}
      />
    </div>
  );
}
