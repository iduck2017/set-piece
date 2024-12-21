import { FactoryService } from '@/set-piece';
import React, { useCallback, useMemo, useRef, useState } from 'react';

interface Option {
    label: string;
    value: string;
}

interface SelectProps {
    options: Option[];
    value?: string;
    onChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
    options,
    onChange
}) => {
    const [ searchText, setSearchText ] = useState('');
    const [ isOpen, setIsOpen ] = useState(false);
    const id = useRef(FactoryService.uuid);

    const filteredOptions = useMemo(() => 
        options.filter(option => 
            option.label.toLowerCase().includes(searchText.toLowerCase())),
    [ options, searchText ]);

    const handleSelect = useCallback((value: string) => {
        onChange?.(value);
        setSearchText(value);
        setIsOpen(false);
    }, [ onChange ]);

    document.addEventListener('click', (e) => {
        const selectElem = document.getElementById(id.current);
        const target: any = e.target;
        if (!selectElem?.contains(target)) {
            setIsOpen(false);
        }
    });

    return (
        <div>
            <div id={id.current}>
                <input
                    className='select input'
                    type="text"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    placeholder="Search..."
                    onClick={() => {
                        setIsOpen(true);
                        setSearchText('');
                    }}
                    autoFocus
                />
                {isOpen && (
                    <div className='select options'>
                        {filteredOptions.map(option => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
