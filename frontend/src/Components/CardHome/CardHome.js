import './CardHome.scss'

const CardHome = props => {
    return(
           <div className={`cardHome_style ${props.className}`}>
               <h2 className={`cardHome_titleStyle ${props.classTitle}`}>{props.title}</h2>
               <div className="cardHome_content">
                   {props.children}
               </div>
           </div> 
    )

}

export default CardHome;