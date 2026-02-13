"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MindMapContextType {
    historyRoot: unknown;
    setHistoryRoot: (node: unknown) => void;
    currentNode: unknown;
    setCurrentNode: (node: unknown) => void;
    seenTopics: string[];
    setSeenTopics: (topics: string[]) => void;
}

const MindMapContext = createContext<MindMapContextType | undefined>(undefined);

export function MindMapProvider({ children }: { children: ReactNode }) {
    const [historyRoot, setHistoryRoot] = useState<unknown>(null);
    const [currentNode, setCurrentNode] = useState<unknown>(null);
    const [seenTopics, setSeenTopics] = useState<string[]>([]);

    return (
        <MindMapContext.Provider value={{
            historyRoot,
            setHistoryRoot,
            currentNode,
            setCurrentNode,
            seenTopics,
            setSeenTopics
        }}>
            {children}
        </MindMapContext.Provider>
    );
}

export function useMindMap() {
    const context = useContext(MindMapContext);
    if (context === undefined) {
        throw new Error('useMindMap must be used within a MindMapProvider');
    }
    return context;
}
