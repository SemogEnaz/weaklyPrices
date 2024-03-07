import { Dispatch, SetStateAction, createContext, useContext, useState } from "react";

type NumericState = {
    state: number,
    setState: Dispatch<SetStateAction<number>>
}

const defaultNumericState = {
    state: 0,
    setState: () => {}
}

const CategoryIndexContext = createContext<NumericState>(defaultNumericState);

const PagerContext = 
    createContext<{
        itemCount: NumericState, pageCount: NumericState}>({
        itemCount: defaultNumericState, pageCount: defaultNumericState});

const ViewListContext = 
    createContext<{
        state: boolean, setState: Dispatch<SetStateAction<boolean>>}>({
        state: false, setState: () => {}});

// Custom hooks for the contexts
export const useCategoryIndex = () => useContext(CategoryIndexContext);
export const usePagerContext = () => useContext(PagerContext);
export const useViewList = () => useContext(ViewListContext);

export function CategoryIndexProvider({ children }: { children: JSX.Element }) {
    const [categoryIndex, setIndex] = useState(6);      // Category selection panel

    return (
        <CategoryIndexContext.Provider value={{state: categoryIndex, setState: setIndex}}>
            { children }
        </CategoryIndexContext.Provider>
    );
}

export function PagerProvider({ children }: { children: JSX.Element }) {
    const [itemCount, setItemCount] = useState(10);     // Item count selection panel
    const [pageCount, setPageCount] = useState(1);      // Page count selection panel

    return (
        <PagerContext.Provider value={{
            itemCount: { state: itemCount, setState: setItemCount },
            pageCount: { state: pageCount, setState: setPageCount } }}>
                { children }
        </PagerContext.Provider>
    );
}

export function ViewListProvider({ children }: { children: JSX.Element }) {
    const [isMyList, setIsMyList] = useState(false);    // Mylist selection panel

    return (
        <ViewListContext.Provider value={{
            state: isMyList, setState: setIsMyList }}>
            { children }
        </ViewListContext.Provider>
    );
}