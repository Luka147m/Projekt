import React, { useState, useEffect } from "react";

const Menu = ({ onUpdateMarkerData, onCheckboxChange, isChecked }) => {
    const [number, setNumber] = useState("");
    const [selectedRoute, setSelectedRoute] = useState(null);

    const handleCheckboxChange = () => {
        const newCheckedState = !isChecked;
        onCheckboxChange(newCheckedState);
    };

    const handleNumberChange = (e) => {
        setNumber(e.target.value);
    };

    const fetchData = () => {
        fetch(`/api/route/${number}`)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Pogreška u odgovoru");
                }
            })
            .then((data) => {
                //console.log(data);
                onUpdateMarkerData(data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    };

    useEffect(() => {
        if (selectedRoute) {
            fetchData();

            const interval = setInterval(fetchData, 30000);
            return () => clearInterval(interval);
        }
    }, [selectedRoute]);

    const handleSelectRoute = () => {
        setSelectedRoute(number);
    };

    return (
        <div className="menu-component">
            <h1>Zet tracker</h1>
            <input
                type="text"
                value={number}
                onChange={handleNumberChange}
                placeholder="Unesi broj linije!"
            />

            {selectedRoute && (
                <label>
                    Prikaži rutu:
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                    />
                </label>
            )}
            <button onClick={handleSelectRoute}>Prikaži</button>
        </div>
    );
};

export default Menu;
