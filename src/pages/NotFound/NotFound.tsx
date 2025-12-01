import React from "react";
import Card from "../../components/common/Card/Card";

const NotFound: React.FC = () => (
  <main className="wrap">
    <section className="section">
      <Card>
        <h1>404 — Page Not Found</h1>
        <p>The page you are looking for does not exist. Please check the URL or return to the homepage.</p>
      </Card>
    </section>
  </main>
);

export default NotFound;
