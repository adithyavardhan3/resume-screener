import { useState } from "react";
import Header from "./components/Header.jsx";
import SeekerView from "./components/SeekerView.jsx";
import RecruiterView from "./components/RecruiterView.jsx";
import Footnote from "./components/Footnote.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("seeker");

  return (
    <div className="wrap">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "seeker" ? <SeekerView /> : <RecruiterView />}
      <Footnote />
    </div>
  );
}
