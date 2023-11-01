import React, { useState } from "react";
import "./App.css";
import Menu from "./Menu.js";
import Map from "./Map.js";

function App() {
    const [markerData, setMarkerData] = useState([]);
    const [isChecked, setIsChecked] = useState(false);

    const updateMarkerData = (newData) => {
        setMarkerData(newData);
    };

    const handleCheckboxChange = (isChecked) => {
        setIsChecked(isChecked);
    };

    return (
        <div className="container">
            <Menu
                onUpdateMarkerData={updateMarkerData}
                onCheckboxChange={handleCheckboxChange}
                isChecked={isChecked}
            />
            <Map markerData={markerData} isChecked={isChecked} />
        </div>
    );
}

export default App;
