import { useState } from "react"
import RenovacionCompleta from "./RenovacionCompleta";
import Interiorismo from "./Interiorismo";

export default function Tabs({ tabs }) {

  const [activeTab, setActiveTab] = useState(0);

  return(
    <div className="tabs-container mx-auto max-w-5xl">
      <div className="tabs-header flex">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab-button grow p-4 rounded-sm transition-all ${activeTab === index ? 'bg-white': 'bg-gray-400'}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tabs[activeTab].content}
      </div>
    </div>
  )
};