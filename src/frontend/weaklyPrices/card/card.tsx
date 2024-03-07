import './card.css';
import '../lds/lds-wave.css';
import styles from '../button.module.css';

import { useState, useEffect } from 'react';
import { useList, useListOperations } from '../ListContext';
import { useViewList, useCategoryIndex, usePagerContext } from '../pages/NavContext';

import { Checkbox } from '../checkbox/checkbox';
import { Item } from '../types';

type TitleData = {
    titleContent: string,
    titleCss: string
};

type LinkData = {
    handleClick: () => void,
    linkContent: string
}

type BrandCardProps = {
    titleData: TitleData,
    linkData: LinkData,
    apiArg: string
}

export function BrandCard({ titleData, linkData, apiArg }: BrandCardProps) {
    
    // Get brandName instead of catalogue, await for fetch in table?

    const validThru = getValidDates();
    const validThruHTML = <p className='validDates'>{validThru} (Every <span className={''}>Monday</span>)</p>;

    return (
        <>
        <div className={`card`}>
            <Title title={titleData.titleContent} titleCSS={titleData.titleCss} validDates={validThruHTML}/>
            <Table apiArg={apiArg} />
            <Button setState={linkData.handleClick} content={linkData.linkContent}/>
        </div>
        </>
    );
}

export function DetailsCard({ categories, brandName }: { categories: string[], brandName: string}) {
    const { state: isMyList } = useViewList();
    const { state: cardIndex } = useCategoryIndex();
    const { itemCount: { state: itemCount }} = usePagerContext();
    const { pageCount: { state: pageCount }} = usePagerContext();

    const correctCount = (count: number, initial: number) => 
        count == 0 ? initial : count;

    if (isMyList) return null;

    const title = categories [
        cardIndex > categories.length ? 
        0 : cardIndex
    ];

    let apiArg =  
        `detailed?brand=${brandName}&` +
        `category=${encodeURIComponent(title)}&`;

    apiArg += `pageCount=${correctCount(pageCount, 1)}&`; 
    apiArg += `itemCount=${correctCount(itemCount, 10)}`;

    return (
        <div className='card details show'>
            <Title title={title} titleCSS='text-5xl font-medium' validDates={null} />
            <Table apiArg={apiArg} />
        </div>
    );
}

export function MyList() {

    const items = useList();
    const { state: isMyList } = useViewList();

    if (!isMyList) return null;

    const LoadingScreen = () => (
        <div className="card-content flex justify-center items-center text-3xl">
            <span className='opacity-75 tracking-widest text-center'>
                No items saved<br></br>so empty...</span></div>
    )

    return (
        <div className="card details show">

            <Title title={'Saved Items:'} titleCSS='text-5xl font-medium' validDates={null} />

            {items && items.length > 0 ?
            <Table items={items}/> :
            <LoadingScreen />}

        </div>
    )
}

const Title = ({ title, titleCSS, validDates }: 
    {title: string, titleCSS: string, validDates: null | JSX.Element}) => (

        <div className="title">
            <h2 className={titleCSS}>
                {title}
            </h2>
            {validDates}
        </div>
)

function Table({ apiArg, items }: 
    { apiArg?: string | undefined, items?: Item[] | undefined }) {

    const [catalogue, setCatalogue] = useState<Item[]>([]);
    const [isError, setError] = useState(false);

    useEffect(() => {
        if (apiArg)
            fetch(`/${apiArg}`)
                .then(res => {
                    if (!res.ok) {
                            setError(true);
                            return {summary: []};
                    }
                    else
                        return res.json();
                })
                .then(data => data.summary)
                .then(summary => setCatalogue(summary));
        else if (items)
            setCatalogue(items);
        else
            setError(true)
    }, [apiArg, items]);

    const Heading = () => (
        <div className='w-heading'>
            <p className='name'>Items</p>
            <p className='price'>Prices</p>
        </div>
    );

    const Items = ({ catalogue }: any) => {

        const list = useList();
        const { addItem, removeItem, inList } = useListOperations();

        const toggleCheckbox = (item: any): void => {
            if (inList(item.link))
                removeItem(item.link);
            else
                addItem(item);
        }

        return (
            catalogue.map(( item: Item, index: number ) => (
                <div key={index} className='item'>

                    {list ?
                        <Checkbox
                        isChecked={inList(item.link)}
                        handleClick={() => toggleCheckbox(item)}/>
                    : null}
                    
        
                    <a href={item.link} target={'_blank'} className={`
                        name p-2
                        border-r-4 border-r-[#000080]`}>
                        {item.name}
                    </a>

                    <div className='price'>
                        <div className="
                            text-gray-500 font-semibold w-1/2 text-right
                        ">${item.oldPrice}</div>
                        &nbsp;
                        <div className="w-1/2 text-left">${item.newPrice}</div>     
                    </div>
        
                </div>
            ))
        );
    };

    const Loading = ({ message }: { message: string }) => {

        return (
            <div className="center">
                <div className='font-bold text-3xl drop-shadow-md text-center'>{`${message}`}</div>
            </div>
        );
    }

    const mockItems = [
        ['This is a mock item index 100', '12', '34'],
        ['Needed for the loading screen of my app', '45', '56.7'],
        ['Just figured out height animation', '78', '89'],
        ['What a pain in the ass XD', '14.4', '4']
    ]

    const makeMockObjs = (mockItems: string[][]) => {
        const objArr = [];
        for (let i = 0; i < mockItems.length; i++) {
            const attrs = mockItems[i];

            objArr.push({
                link: '',
                name: attrs[0], 
                oldPrice: attrs[1],
                newPrice: attrs[2]
            });
        }
        return objArr;
    }

    return (
        catalogue != undefined && catalogue.length > 0 ?
        <div className='card-content end-height'>
            <Heading />
            <Items catalogue={catalogue} />
        </div> 
        :
        <div className='card-content skeleton'>
            <div className="lds-wave">
                <Heading />
                <Items catalogue={makeMockObjs(mockItems)} />
                <Loading message={isError ? `API Error` : `Retriving Data`} />
            </div>
        </div>
    );
}

function Button({ setState, content }: { setState: () => void, content: string}) {
    return (
        <div 
            onClick={setState}
            className={styles.button}>
          {content}
        </div>
    )
}

function getValidDates(): string {

    const currentDate = new Date();

    const priorDate = new Date();
    const henceDate = new Date();

    let dayCount = 0

    while (priorDate.getDay() != 1) {
        priorDate.setDate(currentDate.getDate() + dayCount);
        dayCount--;
    }

    dayCount = 0;

    while (henceDate.getDay() != 1) {
        henceDate.setDate(currentDate.getDate() + dayCount);
        dayCount++;
    }

    const priorDay = getDateStr(priorDate);
    const henceDay = getDateStr(henceDate);

    return priorDay + ' to ' + henceDay;
}

function getDateStr(dateObj: Date): string {
    return `${dateObj.getDate()}/${dateObj.getMonth()+1}`;
}