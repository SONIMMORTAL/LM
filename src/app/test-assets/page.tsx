export default function Page() {
    const containerStyle = "relative w-[200px] h-[200px] border-2 border-gray-300 bg-gray-100 mb-8 overflow-hidden";
    const baseImgStyle = "absolute inset-0 w-full h-full object-contain";

    // Variations
    const variations = [
        { name: "Centered (50%)", width: "92%", left: "50%" },
        { name: "Left 45%", width: "92%", left: "45%" },
        { name: "Left 42%", width: "92%", left: "42%" },
        { name: "Left 40%", width: "92%", left: "40%" },
        { name: "Left 38%", width: "92%", left: "38%" },
        { name: "Left 35%", width: "92%", left: "35%" },
    ];

    return (
        <div className="bg-white p-10 grid grid-cols-3 gap-10">
            {variations.map((v) => (
                <div key={v.name} className="flex flex-col items-center">
                    <p className="mb-2 font-bold">{v.name}</p>
                    <div className={containerStyle}>
                        <img src="/turntable-png-122ht71e15vmwvi2.avif" className={baseImgStyle} />
                        <img
                            src="/vinylsolo.png"
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 object-contain opacity-80"
                            style={{
                                width: v.width,
                                height: v.width,
                                left: v.left
                            }}
                        />
                        {/* Crosshair for reference */}
                        <div className="absolute top-1/2 left-1/2 w-full h-[1px] bg-red-500/50 -translate-x-1/2"></div>
                        <div className="absolute top-1/2 left-1/2 h-full w-[1px] bg-red-500/50 -translate-y-1/2"></div>
                    </div>
                </div>
            ))}

            {/* Sizing Variations */}
            <div className="flex flex-col items-center">
                <p className="mb-2 font-bold">Size 100% Left 42%</p>
                <div className={containerStyle}>
                    <img src="/turntable-png-122ht71e15vmwvi2.avif" className={baseImgStyle} />
                    <img
                        src="/vinylsolo.png"
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 object-contain opacity-80"
                        style={{ width: "100%", height: "100%", left: "42%" }}
                    />
                </div>
            </div>
            <div className="flex flex-col items-center">
                <p className="mb-2 font-bold">Size 85% Left 42%</p>
                <div className={containerStyle}>
                    <img src="/turntable-png-122ht71e15vmwvi2.avif" className={baseImgStyle} />
                    <img
                        src="/vinylsolo.png"
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 object-contain opacity-80"
                        style={{ width: "85%", height: "85%", left: "42%" }}
                    />
                </div>
            </div>

        </div>
    )
}
