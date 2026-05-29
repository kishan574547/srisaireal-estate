import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPropertyById } from "../services/api";

function formatPrice(price) {
  if (price >= 10000000)
    return `₹${(price / 10000000).toFixed(2)} Cr`;

  if (price >= 100000)
    return `₹${(price / 100000).toFixed(2)} L`;

  return `₹${price?.toLocaleString("en-IN")}`;
}

export default function PropertyDetails() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const res = await getPropertyById(id);
      setProperty(res.data.property);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        Loading Property...
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ padding: 40 }}>
        Property Not Found
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#F8F5F0",
        minHeight: "100vh",
        padding: "30px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Images */}

        {property.images?.length > 0 && (
          <>
            <img
              src={property.images[imgIndex]?.url}
              alt={property.title}
              style={{
                width: "100%",
                height: "500px",
                objectFit: "cover",
                borderRadius: "20px",
                marginBottom: "15px",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "30px",
              }}
            >
              {property.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt=""
                  onClick={() => setImgIndex(i)}
                  style={{
                    width: "90px",
                    height: "90px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    cursor: "pointer",
                    border:
                      i === imgIndex
                        ? "3px solid #C9A84C"
                        : "2px solid #ddd",
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Title */}

        <h1
          style={{
            color: "#0D1B2A",
            marginBottom: "10px",
          }}
        >
          {property.title}
        </h1>

        <h2
          style={{
            color: "#C9A84C",
            marginBottom: "20px",
          }}
        >
          {formatPrice(property.price)}
        </h2>

        {/* Info Grid */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <div>🏠 {property.propertyType}</div>
          <div>📍 {property.city}</div>
          <div>🛏 {property.bedrooms} Bedrooms</div>
          <div>🚿 {property.bathrooms} Bathrooms</div>
          <div>📐 {property.area} Sq.ft</div>
          <div>📌 {property.status}</div>
        </div>

        {/* Location */}

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "15px",
            marginBottom: "20px",
          }}
        >
          <h3>Location</h3>

          <p>
            {property.location}, {property.city},{" "}
            {property.state}
          </p>
        </div>

        {/* Description */}

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "15px",
            marginBottom: "20px",
          }}
        >
          <h3>Description</h3>

          <p>{property.description}</p>
        </div>

        {/* Amenities */}

        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "15px",
            marginBottom: "20px",
          }}
        >
          <h3>Amenities</h3>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {property.amenities?.map(
              (item, index) => (
                <span
                  key={index}
                  style={{
                    background: "#C9A84C",
                    color: "#fff",
                    padding:
                      "8px 14px",
                    borderRadius:
                      "20px",
                  }}
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>

        {/* Enquiry */}

        <a
          href={`https://wa.me/919000000000?text=Hi, I am interested in ${property.title}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            background: "#25D366",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          WhatsApp Enquiry
        </a>
      </div>
    </div>
  );
}