type Props = {
  title: string;
  value: number | string;
};

export default function DashboardCard({ title, value }: Props) {
  return (
    <div
      style={{
        background: "#111",
        border: "1px solid #222",
        borderRadius: 14,
        padding: 24,
      }}
    >
      <p
        style={{
          color: "#888",
          marginBottom: 10,
        }}
      >
        {title}
      </p>

      <h2
        style={{
          fontSize: 36,
          fontWeight: 700,
        }}
      >
        {value}
      </h2>
    </div>
  );
}