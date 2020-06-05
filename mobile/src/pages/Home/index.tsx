import React, {useState, useEffect} from 'react'
import axios from 'axios'
import {useNavigation} from '@react-navigation/native'

import {StyleSheet, ImageBackground, View, Image, Text, Picker, Alert} from 'react-native'
import {RectButton} from 'react-native-gesture-handler'

import {Feather as Icon} from '@expo/vector-icons'

interface IBGEUFResponse {
  sigla: string,
}

interface IBGECityResponse {
  nome: string,
}

const Home = () => {
  const [UFs, setUFs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedUF, setSelectedUF] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')

  const navigation = useNavigation()

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

  function handleNavigation() {
    if(selectedCity === '0' || selectedUF === '0'){
      Alert.alert('Epa!', 'Selecione um local válido!')
      return
    }

    navigation.navigate('Points', {
      uf: selectedUF,
      city: selectedCity
    })
  }

  return (
    <ImageBackground
      source={require('../../assets/home-background.png')}
      style={styles.container}
      imageStyle={{width: 274, height: 368}}
    >
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')}/>
        <Text style={styles.title}>Seu marketplace de coleta de resíduos.</Text>
        <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.picker}>
          <Picker
            selectedValue={selectedUF}
            onValueChange={item => setSelectedUF(item)}
          >
              <Picker.Item label="Selecione uma UF" value="0" />
              {UFs.map(item => <Picker.Item key={item} label={item} value={item} />)}
          </Picker>
        </View>

        <View style={styles.picker}>
          <Picker
            selectedValue={selectedCity}
            onValueChange={item => setSelectedCity(item)}
          >
              <Picker.Item label="Selecione uma cidade" value="0" />
              {cities.map(item => <Picker.Item key={item} label={item} value={item} />)}
          </Picker>
        </View>

        <RectButton style={styles.button} onPress={handleNavigation}>
          <View style={styles.buttonIcon}>
            <Text> <Icon name='arrow-right' color='#FFF' size={24}/> </Text>
          </View>
          <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  picker: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
    justifyContent: 'center'
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
})

export default Home