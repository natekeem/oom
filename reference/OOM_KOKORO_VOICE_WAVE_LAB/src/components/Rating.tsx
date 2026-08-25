type Props = {
  value: number;
  onChange: (value: number) => void;
};

export function Rating({ value, onChange }: Props) {
  return (
    <div className="rating" aria-label="개인 청취 평가">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          className={score <= value ? "rating-dot is-on" : "rating-dot"}
          aria-label={`${score}점`}
          onClick={() => onChange(score)}
        />
      ))}
      <span>{value ? `${value}/5` : "미평가"}</span>
    </div>
  );
}
