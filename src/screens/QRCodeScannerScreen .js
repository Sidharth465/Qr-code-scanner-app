import React, { useState, useEffect } from 'react';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';
import { SafeAreaView, StyleSheet, Text, View, Button, Modal, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QRCodeScannerScreen = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back',{
    physicalDevices: ['builtin_wide_angle_camera'] // or 'discovery_multi_frame
  });
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [codesList, setCodesList] = useState([]);
  const [scannedCode, setScannedCode] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  

  const checkPermission = async () => {
    if (!hasPermission) {
      await requestPermission();
    }
  };
   useEffect(()=>{
    
    checkPermission();
   },[hasPermission,requestPermission])

   
  useEffect(() => {
    // Load the history from AsyncStorage when the component mounts
    const loadHistory = async () => {
      try {
        const history = await AsyncStorage.getItem('qrCodeHistory');
        if (history) {
          const parsedHistory = JSON.parse(history);
          setCodesList(parsedHistory);
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };

    loadHistory();
  }, []);

  const startScanner = () => {

    setIsScannerActive(true);
  };

  const stopScanner = () => {
    setIsScannerActive(false);
  };

  const handleCodeScanned = (codes) => {
    if (isScannerActive) {
      const newCodesList = codes.map(code => code.value);
      setCodesList(prevList => [...prevList, ...newCodesList]);
      stopScanner();
      showScannedCode(newCodesList);
      console.log(newCodesList)
    }
  };

  const showScannedCode = (code) => {
    console.log("Show Scanned Code",code)
    setScannedCode(code);
    setIsModalVisible(true);
  };

  const saveToHistory = async () => {
    if (scannedCode) {
      try {
        const history = await AsyncStorage.getItem('qrCodeHistory');
        const parsedHistory = history ? JSON.parse(history) : [];
        const newEntry = { content: scannedCode, timestamp: Date.now() };
        const updatedHistory = [...parsedHistory, newEntry];
        await AsyncStorage.setItem('qrCodeHistory', JSON.stringify(updatedHistory));
        setScannedCode(null);
        setIsModalVisible(false);
      } catch (error) {
        console.error('Error saving to history:', error);
      }
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('qrCodeHistory');
      setCodesList([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => showScannedCode(item.content)}>
      <View style={styles.historyItem}>

        <Text style={{color:"blue",fontSize:20}}>{item.content}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center',gap:10,marginTop:5 }}>
      <View style={{ height: 300, width: '80%', }}>
        {device && <Camera
          style={[StyleSheet.absoluteFill,{}]}
          device={device}
          isActive={isScannerActive}
          codeScanner={{ onCodeScanned: handleCodeScanned, codeTypes: ['qr'] }}
        />}
        
       
      </View>
      <Button title="Start Scanner" onPress={startScanner} />
      <Modal
        animationType="slide"
        transparent={false}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
          <View style={{height:400,width:'90%' ,backgroundColor:'white',borderWidth:1,borderRadius:10}}>
        <View style={{flex:1}}>
        <Text style={{color:"black",fontSize:20,padding:10}}>Scanned Code: {scannedCode}</Text>
        </View>
         <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginHorizontal:10,marginBottom:10}}>
         <Button title="Save to History" onPress={saveToHistory} />
          <Button title="Close" onPress={() => setIsModalVisible(false)} />
         </View>
          </View>
        </View>
      </Modal>

      <Button title="Clear History" onPress={clearHistory} />
     {codesList.length > 0 &&  <View style={{flex:1}}>
        <Text style={{textAlign:"center",color:"black",fontSize:20}}>History</Text>
      <FlatList
          data={codesList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      </View>}
    </SafeAreaView>
  );
};

export default QRCodeScannerScreen;

const styles = StyleSheet.create({
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
