import { useRef, useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { useStorage, useMutation } from "@liveblocks/react";
import { LEFT_MARGIN_DEFAULT, MIN_SPACE, RIGHT_MARGIN_DEFAULT } from "@/constants/margins";
import { PAGE_WIDTH } from "@/constants/page";

const markers = Array.from({ length: 83 }, (_, i) => i);

export const Ruler = () => {
    const storageRoot = useStorage((root) => root); // Ensure storage is loaded
    
    const leftMargin = storageRoot?.leftMargin ?? LEFT_MARGIN_DEFAULT;
    const setLeftMargin = useMutation(({ storage }, position: number) => {
        if (storageRoot) {
            storage.set("leftMargin", position);
        }
    }, [storageRoot]);

    const rightMargin = storageRoot?.rightMargin ?? RIGHT_MARGIN_DEFAULT;
    const setRightMargin = useMutation(({ storage }, position: number) => {
        if (storageRoot) {
            storage.set("rightMargin", position);
        }
    }, [storageRoot]);

    const [isDraggingLeft, setIsDraggingLeft] = useState(false);
    const [isDraggingRight, setIsDraggingRight] = useState(false);
    const rulerRef = useRef<HTMLDivElement>(null);

    const handleLeftMouseDown = () => {
        setIsDraggingLeft(true);
    };

    const handleRightMouseDown = () => {
        setIsDraggingRight(true);
    };
    
    const handleMouseMove = (e: React.MouseEvent) => {
        if ((isDraggingLeft || isDraggingRight) && rulerRef.current) {
            const container = rulerRef.current.querySelector("#ruler-container");
            
            if (container) {
                const containerRect = container.getBoundingClientRect();
                const relativeX = e.clientX - containerRect.left;
                const rawPosition = Math.max(0, Math.min(PAGE_WIDTH, relativeX));

                if (isDraggingLeft) {
                    const maxLeftPosition = PAGE_WIDTH - rightMargin - MIN_SPACE;
                    const newLeftPosition = Math.min(rawPosition, maxLeftPosition);
                    setLeftMargin(newLeftPosition); 
                } else if (isDraggingRight) {
                    const maxRightPosition = PAGE_WIDTH - (leftMargin + MIN_SPACE);
                    const newRightPosition = Math.max(PAGE_WIDTH - rawPosition, 0);
                    const constrainedRightPosition = Math.min(newRightPosition, maxRightPosition);
                    setRightMargin(constrainedRightPosition);
                }
            }
        }
    };
    
    const handleMouseUp = () => {
        setIsDraggingLeft(false);
        setIsDraggingRight(false);
    };

    const handleLeftDoubleClick = () => {
        setLeftMargin(LEFT_MARGIN_DEFAULT);
    };

    const handleRightDoubleClick = () => {
        setRightMargin(RIGHT_MARGIN_DEFAULT);
    };

    if (!storageRoot) return null; // Prevents using storage before it's loaded

    return ( 
        <div 
            ref={rulerRef}
            className={`w-[${PAGE_WIDTH}px] mx-auto h-6 border-b border-gray-300 flex items-end relative select-none print:hidden`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div id="ruler-container" className="w-full h-full relative">
                <Marker 
                    position={leftMargin}
                    isLeft={true}
                    isDragging={isDraggingLeft}
                    onMouseDown={handleLeftMouseDown}
                    onDoubleClick={handleLeftDoubleClick}
                />
                <Marker 
                    position={rightMargin}
                    isLeft={false}
                    isDragging={isDraggingRight}
                    onMouseDown={handleRightMouseDown}
                    onDoubleClick={handleRightDoubleClick}
                />
                <div className="absolute inset-x-0 bottom-0 h-full">
                    <div className={`relative h-full w-[${PAGE_WIDTH}px]`}>
                        {markers.map((marker) => {
                            const position = (marker * PAGE_WIDTH) / 82;

                            return (
                                <div 
                                    key={marker}
                                    className="absolute bottom-0"
                                    style={{ left: `${position}px`}}
                                >
                                    {marker % 10 === 0 && (
                                        <>
                                            <div className="absolute bottom-0 w-[1px] h-2 bg-neutral-500" />
                                            <span className="absolute bottom-2 text-[10px] text-neutral-500 transform -translate-x-1/2">
                                                {marker / 10 + 1}
                                            </span>
                                        </>
                                    )}

                                    {marker % 5 === 0 && marker % 10 !== 0 && (
                                        <div className="absolute bottom-0 w-[1px] h-1.5 bg-neutral-500" />
                                    )}

                                    {marker % 5 !== 0 && (
                                        <div className="absolute bottom-0 w-[1px] h-1 bg-neutral-500" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
 
interface MarkerProps {
    position: number;
    isLeft: boolean;
    isDragging: boolean;
    onMouseDown: () => void;
    onDoubleClick: () => void;
}

const Marker = ({
    position,
    isLeft,
    isDragging,
    onMouseDown,
    onDoubleClick
}: MarkerProps) => {
    return (
        <div 
            className="absolute top-0 w-4 h-full cursor-ew-resize z-[5] group -ml-2"
            style={{ [isLeft ? "left" : "right" ]: `${position}px` }}
            onMouseDown={onMouseDown}
            onDoubleClick={onDoubleClick}
        >
            <FaCaretDown className="absolute left-1/2 top-0 h-full fill-blue-500 transform -translate-x-1/2" />
            <div 
                className="absolute left-1/2 top-4 transform -translate-x-1/2"
                style={{
                    height: "100vh",
                    width: "1px",
                    transform: "scaleX(0.5)",
                    backgroundColor: "#3b72f6",
                    display: isDragging ? "block" : "none",
                }}
            />
        </div>
    );
}
