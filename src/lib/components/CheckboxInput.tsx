type Props = {
  id: string;
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function CheckboxInput({ id, label, checked, onChange }: Props) {
  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(ev) => onChange(ev.target.checked)}
      />
    </div>
  );
}
