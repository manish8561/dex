import './Button.scss'

const Button = props => {
    return(
        <button onClick={props.onClick} type={props.type} className={`btn buttonStyle ${props.className}`} disabled={props.disabled}>
            {props.children}
        </button>
    )

}

export default Button