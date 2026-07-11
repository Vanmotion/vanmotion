export const en = {
  brand: "VANMOTION",

  heroTitle: "OBJECTS FOR PEOPLE WHO NEVER STOP MOVING",

  heroSubtitle: "Premium Automotive Lifestyle",

  explore: "EXPLORE",

  menu: {
    shop: "SHOP",
    about: "ABOUT",
    journal: "JOURNAL",
    contact: "CONTACT",
  },
};
  export default function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        background: "#0B0B0B",
        color: "#F5F2ED",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div>
        <p
          style={{
            fontSize: "14px",
            letterSpacing: "6px",
            opacity: 0.6,
          }}
        >
          VANMOTION
        </p>

        <h1
          style={{
            fontSize: "72px",
            margin: "20px 0",
            lineHeight: 1,
          }}
        >
          OBJECTS FOR PEOPLE
          <br />
          WHO NEVER STOP MOVING
        </h1>

        <p
          style={{
            fontSize: "22px",
            opacity: 0.75,
            marginBottom: "40px",
          }}
        >
          Premium Automotive Lifestyle
        </p>

        <button
          style={{
            background: "transparent",
            color: "white",
            border: "1px solid white",
            padding: "16px 36px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          EXPLORE →
        </button>
      </div>
    </section>
  );
}