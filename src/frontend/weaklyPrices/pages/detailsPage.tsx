import styles from '../button.module.css'
import './nav/nav.css'

import { useEffect, useMemo, useState } from 'react';

import { DetailsCard, MyList } from '../card/card';
import Navigator, { CatagoryPanel } from './nav/nav';

import { ListProvider } from '../ListContext';
import { CategoryIndexProvider, PagerProvider, ViewListProvider } from './NavContext';

export default function DetailsPage({ states }: { states: any }) {

    const { catalogueName, setCatalogueName } = states;
    const [categories, setCatagories] = useState<string[]>([]);

    useEffect(() => {
        fetch(`/weaklyPrices/detailed?brand=${catalogueName}`)
            .then(res => res.json())
            .then(data => setCatagories(data.catagories))
    }, [catalogueName]);

    const toMain = () => {
        setCatalogueName('');
    }

    const categoryPanel = useMemo(() => {
        return  <CatagoryPanel categories={categories}/>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categories]);

    const table = 
        <>
        <MyList />
        <DetailsCard categories={ categories } brandName={ catalogueName } />
        </>

    const LoadingScreen = () => (
        <div className='text-2xl flex justify-center items-center text-justify'>
            Loading catagory names...
        </div>
    );

    const ContentScreen = () => (
        <>
        <Button setState={toMain} content={'Back'}/>

        <div className="display-panel">
            
            <StateAggration>
                <Navigator
                    category={ categoryPanel }
                    table={table} />
            </StateAggration>
        </div>
        </>
    );

    return (
        categories.length == 0 ?
        <LoadingScreen /> :
        <ContentScreen />
    );
}

function StateAggration({ children }: { children: JSX.Element }): JSX.Element {
    return (
        <ListProvider>
            <PagerProvider>
                <CategoryIndexProvider>
                    <ViewListProvider>
                        {children}
                    </ViewListProvider>
                </CategoryIndexProvider>
            </PagerProvider>
        </ListProvider>   
    )
}

export function Button({ setState, content }: { setState: () => void, content: string}) {
    return (
        <div 
            onClick={setState}
            className={styles.button}>
          {content}
        </div>
    )
}