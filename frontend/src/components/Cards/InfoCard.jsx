import React from 'react'

const InfoCard = ({ icon, label, value, color, valueColor }) => {
    const renderValue = () => {
        // Check if the value is a non-null object and not an array
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return (
                <div className='text-xs mt-1 space-y-1'>
                    {Object.entries(value).map(([key, val]) => (
                        <div key={key} className='flex justify-between items-center'>
                            <span className='capitalize text-gray-500'>{key}:</span>
                            <span className='font-semibold text-gray-800'>{val}</span>
                        </div>
                    ))}
                </div>
            );
        }

        // Fallback for numbers or strings
        return (
            <span className={`text-[22px] font-semibold ${valueColor ? valueColor : 'text-gray-800'}`}>
                {value}
            </span>
        );
    };

    return (
        <div className='flex gap-6 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50'>
            <div className={`w-14 h-14 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl`}>
                {icon}
            </div>
            <div>
                <h6 className='text-sm text-gray-500 mb-1'>{label}</h6>
                {renderValue()}
            </div>
        </div>
    )
}

export default InfoCard