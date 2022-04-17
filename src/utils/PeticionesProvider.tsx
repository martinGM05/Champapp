import { StyleSheet, Text, View } from 'react-native'
import React, { createContext, useEffect, useState } from 'react'
import { firebase } from '@react-native-firebase/firestore'
import firestore from '@react-native-firebase/firestore';


export interface ITrabajador {
    Id: string,
    fotoUser: string,
    nombre: string,
    Oficios: string[],
    valoracion: number,

}
export interface IUsuario {
    id: string
    nombre: string,
    numero: string,
    fotoUsuario: string
}
export interface IComentario {
    Id: string,
    IdTrabajador: string,
    calificacion: number,
    comentario: number,
    fotosComentario: string,
    idCliente: string

}
export type ICustomersComments = {
    name: string;
    photo: string;
    comment: string;
}

export type IOficeIcon={
    nameOffice:string;
    iconName:string;
}


interface ContextProps {
    Trabajador: ITrabajador[]
    Oficio: IOficeIcon[]
    comentario: ICustomersComments[]
    listaImagenes: string[],
    averageRating: number,
    GetTrabajadoresComentarios: (id: string) => void
    limpiarState: () => void
    filtroOficio: string[]
    FiltrarOficios: (oficio: string) => void
    setTrabajador: (trabajador: ITrabajador[]) => void
    setTrabajadoraux: (trabajador: ITrabajador[]) => void
    setEventoFiltro:(estado:boolean)=>void
    eventoFiltro:boolean
    Trabajadoraux:ITrabajador[]
    
}

interface Props {
    children: JSX.Element
}

export const Contexto = createContext<ContextProps>({} as ContextProps);



const PeticionesProvider = ({ children }: Props) => {

    const [Trabajador, setTrabajador] = useState<ITrabajador[]>([])
    const [Trabajadoraux, setTrabajadoraux] = useState<ITrabajador[]>([])
    const [Oficio, setOficio] = useState<IOficeIcon[]>([])
    const [comentario, setComentario] = useState<ICustomersComments[]>([])
    const [listaImagenes, setListaImagenes] = useState<string[]>([])
    const [averageRating, setAverageRating] = useState<number>(0)
    const [filtroOficio, setFiltroOficio] = useState<string[]>([])
    const [eventoFiltro, setEventoFiltro]=useState<boolean>(true)

    useEffect(() => {
        function GetTrabajadores() {
            const suscriber = firestore().collection('Trabajadores')
                .onSnapshot(snapshot => {
                    const data = snapshot.docs.map(doc => {
                        const trabajador = doc.data() as ITrabajador;
                        trabajador.Id = doc.id;
                        return trabajador;
                    })
                    setTrabajador([])
                    setTrabajador(data)
                    //setTrabajadoraux(data)
                    // setOficio([])
                    // data.forEach(item => {
                    //     item.Oficios.forEach(item2 => {
                    //         setOficio((item3) => [...item3, item2])
                    //     })
                    // })

                })
           
            return () => suscriber();
        }
        GetTrabajadores()
    }, [])


    function GetTrabajadoresComentarios(id: string) {
        const suscriber = firestore().collection('Trabajadores').doc(id).collection('Comentarios')
            .onSnapshot(snapshot => {
                const data = snapshot.docs.map(doc => {
                    const comentario = doc.data() as IComentario;
                    comentario.Id = doc.id;
                    comentario.IdTrabajador = id
                    return comentario;
                })
                setComentario([])
                setListaImagenes([])
                let auxRating = 0
                setAverageRating(0)
                data.forEach(item => {

                    setListaImagenes(item2 => [...item2, item.fotosComentario])
                    auxRating = auxRating + item.calificacion
                    firestore().collection('Usuarios').doc(item.idCliente).get()
                        .then(function (doc) {
                            if (doc.exists) {
                                const document = JSON.stringify(doc.data())
                                const aux2 = JSON.parse(document)
                                const j = JSON.stringify({ name: aux2['Name'], photo: aux2['Photo'], comment: item.comentario })
                                const aux = JSON.parse(j)
                                setComentario(item3 => [...item3, aux])
                            }
                        })
                })
                setAverageRating(item3 => (item3 + (auxRating / data.length)))
                return () => suscriber();
            })
    }

    function limpiarState() {
        setComentario([])
        setListaImagenes([])
        setAverageRating(0)
    }


    function FiltrarOficios(oficio: string) {
        console.log(oficio);
        let aux: ITrabajador[] = []
      
        
        Trabajador.forEach(item => {
            if (item.Oficios.includes(oficio)) {
                aux = [...aux, item]
            }
        })
        setTrabajadoraux(aux)

        // setTrabajador([])
        // setTrabajador(Trabajadoraux)
        // console.log(Trabajador)
        // const trabajadores = Trabajador.filter(trabajador => trabajador.Oficios.includes(oficio))
        // setTrabajador([])
        // setTrabajador(trabajadores)
    }

    useEffect(()=>{
        function GetOficios(){
            const subscriber = firestore().collection('Oficios')
            .onSnapshot(snapshot => {
                const data = snapshot.docs.map(doc => {
                    const data = doc.data() as IOficeIcon
                    return data;
                })
                setOficio(data)
            })
        return () => subscriber()
        }
        GetOficios()
    },[])

    return (
        <Contexto.Provider value={{
            Trabajador,
            Oficio,
            comentario,
            listaImagenes,
            averageRating,
            GetTrabajadoresComentarios,
            limpiarState,
            filtroOficio,
            FiltrarOficios,
            setTrabajador,
            setTrabajadoraux,
            setEventoFiltro,
            eventoFiltro,
            Trabajadoraux
        }}>
            {children}
        </Contexto.Provider>
    )
}

export default PeticionesProvider

