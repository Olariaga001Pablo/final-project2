import React, { useState } from 'react';
import TabTwoContent from './buzon';
import TabOneContent from './enviar';

const TabsComponent = () => {
    const [activeTab, setActiveTab] = useState('tab1');

    const handleTabClick = (tab = 'tab1') => {
        setActiveTab(tab);
    };

    return (
        <div>
            <div className="flex space-x-4 mb-4">
            </div>
            <div>
                {activeTab === 'tab1' && <TabOneContent />}
            </div>
        </div>
    );
};

export default TabsComponent;
