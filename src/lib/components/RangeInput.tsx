import $ from "./RangeInput.module.scss";

type Props = {
  value?: number;
  defaultValue?: number;
  label?: string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

export function RangeInput({
  value,
  defaultValue,
  label,
  min,
  max,
  step,
  onChange,
}: Props) {
  return (
    <div className={$.container}>
      {label && <label>{label}</label>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(ev) => onChange(ev.target.valueAsNumber)}
        defaultValue={defaultValue}
      />
    </div>
  );
}
