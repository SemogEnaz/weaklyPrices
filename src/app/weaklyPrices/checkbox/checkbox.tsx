import './checkbox.css'

type CheckboxObj = {
    content: string, 
    value: string, 
    attribute: string
};

type State = {
    state: any,
    setState: (state: any) => void
};

export function makeCheckboxsObj(contents: string[], values: string[], attribute = '') {
    const checkboxes = [];

    if (contents.length != values.length) throw new Error("ERROR contents != values");

    for (let i = 0; i < contents.length; i++) {
        checkboxes.push({ 
            content: contents[i],
            value: values[i],
            attribute: attribute
        });
    }

    return checkboxes;
};

export function makeCheckboxes( checkboxes: CheckboxObj[], { state, setState }: State ) {

    const toggle = (checkbox: any) => {
        if (checkbox.attribute)
            setState((option: any) => ({
                ...option,
                [checkbox.attribute]: 
                option[checkbox.attribute] == checkbox.value ? 
                '' : checkbox.value
            }));
        else
            setState((prevState: any) =>
                prevState == checkbox.value ?
                '' : checkbox.value
            );
    }

    return (
        <>
            {checkboxes.map((checkbox: CheckboxObj) => (
                    <Checkbox
                        key={checkbox.value}
                        content={checkbox.content}
                        isChecked={
                            !checkbox.attribute ?
                            state == checkbox.value :
                            state[checkbox.attribute] == checkbox.value
                        }
                        hasFormat={true}
                        handleClick={() => toggle(checkbox)} />
                )
            )}
        </>
    );
};

export function makeDependingCheckboxes(
    checkboxes: {content: string, value: string, attribute: string}[],
    state: {options: any, setOptions: (options: any) => void},
    trigger: boolean) {

    const handleClick = (element: any) => {
        
        // Set value on trigger
        if (trigger)
            state.setOptions((option: any) => ({
                ...option,
                [element.attribute]: 
                option[element.attribute] == element.value ? '' : element.value
            }));
    }

    return (
        <>
            {checkboxes.map((element) => (
                <Checkbox
                    key={element.content}
                    content={element.content}
                    isChecked={state.options[element.attribute] == element.value}
                    hasFormat={trigger}
                    handleClick={() => handleClick(element)} />
            ))}
        </>
    );
};

export const Options = (title: string, component: any): JSX.Element => (
    formOptions(
        title,
        checkboxOptions(component)
    )
)

export const formOptions = (title: string, component: any): JSX.Element => (
        <div className="form-options">
            <div>{title}</div>
            {component}
        </div>
);

export const checkboxOptions = (elements: any): any => (
        <div className="checkbox-options">
            {elements}
        </div>
);

type CheckboxProps = {
    content?: string,
    isChecked: boolean, 
    hasFormat?: boolean,
    handleClick : any
};

export function Checkbox({ content, isChecked, hasFormat, handleClick }: CheckboxProps) {

    const colorClass = hasFormat == undefined ?
        (isChecked ? 'checked' : '') :
        (hasFormat ? (isChecked ? 'checked' : '') : 'blocked');

    return (
        <div className="checkbox">

            <div
                className={`box ${colorClass}`}
                onClick={handleClick}></div>

            <div className="label">{content ? content: ''}</div>

        </div>
    );
};