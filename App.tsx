import {useState, useRef} from 'react';
import { StyleSheet, Text, View, Image} from 'react-native';
import { Appbar, Button, FAB } from 'react-native-paper';
import {Camera} from 'expo-camera';
import Dialog from "react-native-dialog";


export default function App() {

  const [kameratila, setKameratila]= useState<boolean>(false);
  const [kameratilaInfo, setKameraTilaInfo]= useState<string>("");
  const [kameraRef, setKameraRef] = useState<any>("");
  const [virhe, setVirhe] = useState<string>("");
  const [kuva, setKuva] = useState<any>();
  const [kuvaOtsikko, setKuvaOtsikko] = useState<string>("");
  const [kuvaNimi, setKuvaNimi] = useState<string>("");
  const [dialogiNakyvilla, setDialogiNakyvilla] = useState<boolean>(false);

  const lomakeRef = useRef<HTMLFormElement>();


  const kaynnistaKamera = async () => {
  
    const {status} = await Camera.requestCameraPermissionsAsync();
    setKameraTilaInfo("");
    if (status === 'granted'){
      setKameratila(true);
    } else {
      setVirhe("Kamera ei ole saatavilla");
    }

  }

  const otaKuva = async () => {

  setKameraTilaInfo("Odota...")
  
  if (kameraRef){
    setKuva(await kameraRef.takePictureAsync());
    setKameratila(false);
    setDialogiNakyvilla(true);
  }

  }

  const peruutaTeksti = () => {
    setKuvaNimi("");
    setDialogiNakyvilla(false);
  }
  const vahvistaTeksti = () => {
    setDialogiNakyvilla(false);
    setKuvaOtsikko(kuvaNimi);
  }


  const lahetaPalvelimelle = async (lahetettavaKuva : string) : Promise<void> => {

    const formData = new FormData();
      formData.append("file", {
                        uri: kuva.uri,
                        type: "image/jpeg",
                        name: lahetettavaKuva,
                      } as any);

    const yhteys = await fetch("http://192.168.1.121:3002", {
                                method: "POST",
                                body: formData,
                                headers: {
                                  "Content-Type": "multipart/form-data"
                                },
                              });
    const data = (await yhteys.json())

    if (data.viesti == 'onnistui'){
      setKuvaOtsikko('');
    } else {

      setVirhe("Kuvan lataaminen palvelimelle ei onnistunut");
    }

  }
  
  return (
  (kameratila) ? 
  <Camera 
    style ={styles.kamera}
    ref = { (r) => {setKameraRef(r)}}>
    <Text>{kameratilaInfo}</Text>
    <FAB
      style = {styles.fabOtaKuva}
      size = "medium"
      icon = "circle"
      onPress = {() => {otaKuva()}}
    
    />
    <FAB
      style = {styles.fabSulje}
      size = "small"
      icon = "close"
      label = "sulje kamera"
      onPress = {() => {setKameratila(false)}}
    />
  </Camera>
  :
  <>
    <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => {}} />
        <Button icon="camera" onPress={() => {kaynnistaKamera()}}></Button>
    </Appbar.Header>
    <View style={styles.container}>
    <Text>{virhe}</Text>

    { (kuva) ?
  
      <Dialog.Container
        visible={dialogiNakyvilla} >
        <Dialog.Title></Dialog.Title>
        <Dialog.Description>Kirjoita kuvalle nimi:</Dialog.Description>
          <Dialog.Input
            onChangeText={(text) => setKuvaNimi(text)}
          />
          <Dialog.Button
            label= "Cancel" 
            onPress= {peruutaTeksti}/>
          <Dialog.Button
            label= "OK"
            onPress= {vahvistaTeksti}/>
      </Dialog.Container>

      :
      null
    }
    { (kuvaOtsikko && dialogiNakyvilla == false) ?
      <View accessibilityRole= 'image'>
      <Text
        style={styles.kuvaOtsikko}>
      {kuvaOtsikko}
      </Text>
      <Image
        source={{ uri : kuva.uri}}
        style = {styles.kuva}
      />
      <Button
        mode='contained'
        style={{top: 20}}
        onPress={() => {lahetaPalvelimelle(`${kuvaOtsikko}.jpg`)}}>
        Lähetä palvelimelle
      </Button>
      </View>
      : null
  
    }
    </View>
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appbar: {
  },
  kamera: {
    flex: 1
  },
  fabSulje: {
    position: 'absolute',
    margin: 60
  },
  fabOtaKuva: {
    position: 'absolute',
    bottom: 20,
    marginLeft: 160  
  },
  kuva: {
    width : 330,
    height :400,
    resizeMode: 'stretch'

  },
  kuvaOtsikko: {
    marginBottom: 20
  }
});
