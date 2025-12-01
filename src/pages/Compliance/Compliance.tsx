import React from "react";
import Card from "../../components/common/Card/Card";
import "./Compliance.css";

const Compliance: React.FC = () => (
  <main className="wrap">
    <section className="section compliance-section">
      <Card>
        <h1>Compliance</h1>
        <p>Our solutions are designed for GDPR, CCPA, and industry-specific compliance. Security and privacy are built-in at every layer.</p>
      </Card>
    </section>
  </main>
);

export default Compliance;
