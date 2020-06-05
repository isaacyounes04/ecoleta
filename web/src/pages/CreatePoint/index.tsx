import React, {useState, useEffect, ChangeEvent, FormEvent} from 'react'
import {Link, useHistory} from 'react-router-dom'

import {Map, TileLayer, Marker} from 'react-leaflet'
import {LeafletMouseEvent} from 'leaflet'

import axios from 'axios'
import api from '../../services/api'

import logo from '../../assets/logo.svg'
import {FiArrowLeft} from 'react-icons/fi'
import './styles.css'

import Dropzone from '../../components/Dropzone'

interface Item {
    id: number,
    title: string,
    image_url: string
}

interface IBGEUFResponse {
    sigla: string,
}

interface IBGECityResponse {
    nome: string,
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([])
    const [selectedItems, setSelectedItems] = useState<number[]>([])

    const [UFs, setUFs] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])
    const [selectedUF, setSelectedUF] = useState('0')
    const [selectedCity, setSelectedCity] = useState('0')

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])

    const [selectedFile, setSelectedFile] = useState<File>()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    const history = useHistory()

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords

            setInitialPosition([latitude, longitude])
        })
    }, [])
    
    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data)
        })
    }, [])

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const UFInitials = response.data.map(uf => uf.sigla)
            setUFs(UFInitials)
        })
    }, [])

    useEffect(() => {
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response => {
            const cityNames = response.data.map(city => city.nome)
            setCities(cityNames)
        })
    }, [selectedUF])


    function handleSelectUF(e: ChangeEvent<HTMLSelectElement>){
        setSelectedUF(e.target.value)
    }

    function handleSelectCity(e: ChangeEvent<HTMLSelectElement>){
        setSelectedCity(e.target.value)
    }

    function handleMapClick(e: LeafletMouseEvent){
        setSelectedPosition([
            e.latlng.lat,
            e.latlng.lng
        ])
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>){
        const {name, value} = e.target

        setFormData({...formData, [name]: value})
    }

    function handleSelectItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id)

        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id)
            setSelectedItems(filteredItems)
        }else{
            setSelectedItems([...selectedItems, id])
        }
    }

    async function handleSubmit(e: FormEvent){
        e.preventDefault()

        const data = new FormData()

        data.append('name',  formData.name)
        data.append('email',  formData.email)
        data.append('whatsapp',  formData.whatsapp)
        data.append('latitude',  String(selectedPosition[0]))
        data.append('longitude',  String(selectedPosition[1]))
        data.append('city',  selectedCity)
        data.append('uf',  selectedUF)
        data.append('items',  selectedItems.join(','))

        if(selectedFile){
            data.append('image', selectedFile)
        } else{
            alert('Insira todos os dados antes de cadastrar')
            return
        }
        

        await api.post('points', data)

        alert('Ponto de coleta criado com sucesso')
        history.push('/')
    }

    return (
        <div id="page-create-point">    
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft/>
                    Voltar a home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do ponto de coleta</h1>

                <Dropzone onFileUpload={setSelectedFile}/>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange}/>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" id="email" onChange={handleInputChange}/>
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">UF</label>
                            <select name="uf" id="uf" value={selectedUF} onChange={handleSelectUF}>
                                <option value="0">Selecione uma UF</option>
                                    {UFs.map(item => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={handleSelectCity}>
                                <option value="0">Selecione uma cidade</option>
                                    {cities.map(item => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                                key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                            >
                                <img src={item.image_url} alt="Item"/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreatePoint