import React, { createContext, useContext, useReducer } from 'react';
import { Item, Costs } from './types';

const ACTIONS = {
    ADD_ITEM: "add_item",
    REMOVE_ITEM: "remove_item"
} as const;

type Action = 
    { type: typeof ACTIONS.ADD_ITEM; payload: Item; } |
    { type: typeof ACTIONS.REMOVE_ITEM; payload: string; };

type State = {
    list: Item[] | undefined,
    cost: {
        total: Costs,
        last: Costs
    }
};

// Initilization taken from chatGPT (*u*! )
const ListContext = createContext<State & {dispatch: React.Dispatch<Action>} | undefined>(undefined);
const InListContext = createContext<(itemLink: string) => boolean>(() => false);

export function useList() {
    return useContext(ListContext)?.list;
}

export function useCost(): { total: Costs, last: Costs } {
    return useContext(ListContext)!.cost;
}

export function useListOperations(): {
    addItem: (item: Item) => void,
    removeItem: (itemLink: string) => void,
    inList: (itemLink: string) => boolean
} {

    const listContext = useContext(ListContext);
    const inList = useContext(InListContext)

    if (!listContext)
        return {
            addItem: () => {},
            removeItem: () => {},
            inList: () => false
        };

    const { dispatch } = listContext;

    return {
        addItem: (item: Item) => dispatch({
            type: ACTIONS.ADD_ITEM, payload: item
        }),
        removeItem: (itemLink: string) => dispatch({
            type: ACTIONS.REMOVE_ITEM, payload: itemLink
        }),
        inList: inList
    };
}

const listReducer = (state: State, action: Action): State => {

    const makeCost = (saved: string, spent: string | number): Costs => ({
        saved: Number(saved),
        spent: Number(spent)
    })

    const calcDrop = (item: Item): number => (
        Math.round(Number(item.oldPrice) - Number(item.newPrice))
    )

    const op = (op: number | undefined) => op ? -1 : 1;

    const totalCost = (newItem: Item, operator?: number): Costs => {
        const total = state.cost.total;
        const newSaved = (
            total.saved + op(operator) * calcDrop(newItem)
        ).toFixed(2);
        const newSpent = (
            total.spent + op(operator) * Number(newItem.newPrice)
        ).toFixed(2);

        return makeCost(newSaved, newSpent);
    }

    const latestCost = (newItem: Item, operator?: number): Costs => {
        return makeCost(
            (op(operator) * calcDrop(newItem)).toFixed(2), 
            op(operator) * Number(newItem.newPrice)
        );
    }

    switch (action.type) {

        case ACTIONS.ADD_ITEM: {
            const newItem = action.payload;
            return {
                ...state, 
                list: [...state.list!, newItem],
                cost: {
                    total: totalCost(newItem),
                    last: latestCost(newItem)
                }
            };
        }

        case ACTIONS.REMOVE_ITEM: {
            const itemLink = action.payload;
            let itemToRemove;
            return {
                ...state,
                list: state.list!.filter((currentItem: Item) => {
                    if (currentItem.link == itemLink) { 
                        itemToRemove = currentItem;
                        return false;
                    }
                    return true;
                }),
                cost: {
                    total: totalCost(itemToRemove!, -1),
                    last: latestCost(itemToRemove!, -1)
                }
            }
        }

        default:
            return state;
    }
}

/*
    - MyListContext returns the list
    - Add & Remove ItemContext returns the respective function.

    All the above are bundled in the Provider, so all the children
    can access the 3 values, make sure to call it where you want to
    START using it.
*/
export function ListProvider({ children }: { children: JSX.Element}) {

    const defaultValue = {
        list: [],
        cost: {
            total: { saved: 0, spent: 0 },
            last: { saved: 0, spent: 0 }
        }
    };

    const [state, dispatch] = useReducer(listReducer, defaultValue);

    const inList = (itemLink: string): boolean => (
        state.list!.some((currItem: Item) => currItem.link == itemLink)
    );

    return (
        <ListContext.Provider value={{ ...state, dispatch }}>
            <InListContext.Provider value={ inList }>
                {children}
            </InListContext.Provider>
        </ListContext.Provider>
    );
}