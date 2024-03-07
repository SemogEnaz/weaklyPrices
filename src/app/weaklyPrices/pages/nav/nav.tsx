import { makeCheckboxsObj, makeCheckboxes, checkboxOptions } from '../../checkbox/checkbox';
import { useCost } from "../../ListContext";
import { useCategoryIndex, usePagerContext, useViewList } from '../NavContext';

import './nav.css';

type SubPanels = {
    category: JSX.Element,
    table: JSX.Element
}

export default function Navigator({ category, table }: SubPanels): JSX.Element {

    return (
        <div className="nav-panel">
            { category }
            <div className=" flex flex-col">
                <PagerPanel />
                { table }
            </div>
            <div className="">
                <DataPanel />
                <UserListPanel />
            </div>
        </div>
    );
}

function DataPanel() {

    const { total, last } = useCost();

    const formatLastCost = (lastCost: number): JSX.Element => (
        lastCost > 0 ?
        <span style={{color:"darkgreen"}}>+${lastCost}</span> :
        <span style={{color:"darkred"}}>-${-1*lastCost}</span>
    );

    return (
        <div className="data panel">
            <div className="nav-title small">Price Data:</div>
            <div>Saved: ${total.saved} {formatLastCost(last.saved)}</div>
            <div>Spent: ${total.spent} {formatLastCost(last.spent)}</div>
        </div>
    );
}

function UserListPanel() {
    const { setState: setIsMyList } = useViewList();

    return (
        <div className="nav-title small user-list category-button" onClick={() => setIsMyList((prevBool: boolean)  => !prevBool)}>
            View Selected Items
        </div>
    )
}

const PagerPanel = (): JSX.Element => (
    <div className="pager-panel">
        <ItemCountPanel />
        <PageCountPanel />
    </div>
)

function ItemCountPanel() {

    const { itemCount: { state: itemCount }} = usePagerContext();
    const { itemCount: { setState: setItemCount }} = usePagerContext();

    const itemCountObj = makeCheckboxsObj(
        ['10', '15'],
        ['10', '15']
    );

    const itemCountComponent = makeCheckboxes(
        itemCountObj,
        { state: itemCount, setState: setItemCount }
    );

    return (  
        <div className="panel">
            <div className="nav-title small">ltem Count:</div>
            {checkboxOptions(itemCountComponent)}
        </div>
    );
};

function PageCountPanel() {

    const { pageCount } = usePagerContext();

    const itemCountObj = makeCheckboxsObj(
        ['', '', '', '', ''],
        ['1', '2', '3', '4', '5']
    );

    const itemCountComponent = makeCheckboxes(
        itemCountObj, pageCount
    );

    return (  
        <div className="panel">
            <div className="nav-title small">Page Count:</div>
            {checkboxOptions(itemCountComponent)}
        </div>
    );
}

export function CatagoryPanel({ categories }: { categories: string[]}) {

    const { setState: setIndex } = useCategoryIndex();
    const { setState: setViewList } = useViewList();

    const Selector = ({category, index}: 
        { category: string, index: number }): JSX.Element => (
        <div className="category-button" onClick={() => {
            setIndex(index); setViewList(false) }}>
            {category}
        </div>
    );

    return (
        <div className='panel category-panel'>
            <div className="nav-title">Catagories</div>
            <div className="category-button-diplay">
                {categories.map((category, index) => (
                    <Selector
                        key={index}
                        category={category}
                        index={index} />
                ))}
            </div>
        </div>
    )
};