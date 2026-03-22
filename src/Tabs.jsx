import { useState } from "react"
import RenovacionCompleta from "./RenovacionCompleta";
import Interiorismo from "./Interiorismo";

export default function Tabs({ tabs }) {

  const [activeTab, setActiveTab] = useState(0);

  return(
    <div className="tabs-container tx:mx-auto tx:max-w-5xl">
      <div className="tabs-header tx:flex">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tx:tab-button tx:grow tx:p-4 tx:rounded-sm tx:transition-all ${activeTab === index ? 'tx:bg-white': 'tx:bg-gray-400'}`}
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