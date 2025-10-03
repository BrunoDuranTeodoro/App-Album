import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  TextInput,
  Button,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const API_URL = 'http://10.110.12.43:3000/photos';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facing, setFacing] = useState('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');

  useEffect(() => {
    fetchPhotos();
    requestCameraPermission();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("A resposta da rede não foi 'ok'");
      const data = await response.json();
      setPhotos(data.reverse());
    } catch (error) {
      console.error('Erro ao buscar fotos:', error);
      Alert.alert('Erro', 'Não foi possível carregar as fotos. Verifique o servidor e o endereço IP.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    if (!capturedPhoto || !photoTitle) {
      Alert.alert('Atenção', 'Você precisa de uma foto e um título para salvar.');
      return;
    }

    const newPhoto = {
      titulo_foto: photoTitle,
      descricao_foto: photoDescription,
      data_foto: new Date().toISOString(),
      uri: capturedPhoto.uri,
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhoto),
      });

      if (!response.ok) throw new Error("A resposta da rede não foi 'ok'");

      await response.json();
      resetPhotoState();
      await fetchPhotos();
    } catch (error) {
      console.error('Erro ao adicionar foto:', error);
      Alert.alert('Erro', 'Não foi possível salvar a foto.');
    }
  };

  const handleUpdatePhoto = async () => {
    if (!currentPhoto || !photoTitle) {
      Alert.alert('Atenção', 'O título não pode ficar em branco.');
      return;
    }

    const updatedPhoto = {
      ...currentPhoto,
      titulo_foto: photoTitle,
      descricao_foto: photoDescription,
    };

    try {
      const response = await fetch(`${API_URL}/${currentPhoto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPhoto),
      });

      if (!response.ok) throw new Error("A resposta da rede não foi 'ok'");

      await response.json();
      resetPhotoState();
      await fetchPhotos();
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a foto.');
    }
  };

  const handleDeletePhoto = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("A resposta da rede não foi 'ok'");
      await fetchPhotos();
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      Alert.alert('Erro', 'Não foi possível deletar a foto.');
    }
  };

  const openEditModal = (photo) => {
    setCurrentPhoto(photo);
    setPhotoTitle(photo.titulo_foto);
    setPhotoDescription(photo.descricao_foto);
    setEditModalVisible(true);
  };

  const resetPhotoState = () => {
    setCameraModalVisible(false);
    setEditModalVisible(false);
    setCapturedPhoto(null);
    setCurrentPhoto(null);
    setPhotoTitle('');
    setPhotoDescription('');
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedPhoto(photo);
    }
  }

  const renderPhotoItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.uri }} style={styles.photo} />
      <View style={styles.cardContent}>
        <Text style={styles.photoTitle}>{item.titulo_foto}</Text>
        <Text style={styles.photoDescription}>{item.descricao_foto}</Text>
        <Text style={styles.photoDate}>{new Date(item.data_foto).toLocaleDateString()}</Text>
        <View style={styles.buttonGroup}>
          <Button title="Editar" onPress={() => openEditModal(item)} />
          <Button title="Deletar" color="#e53e3e" onPress={() => handleDeletePhoto(item.id)} />
        </View>
      </View>
    </View>
  );

  if (!cameraPermission) {
    return <View />;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          Precisamos de permissão para usar a câmera.
        </Text>
        <Button onPress={requestCameraPermission} title="Conceder Permissão" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>App Álbum (Temporário)</Text>
      <TouchableOpacity style={styles.fab} onPress={() => setCameraModalVisible(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {loading && photos.length === 0 ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          onRefresh={fetchPhotos}
          refreshing={loading}
        />
      )}

      <Modal visible={cameraModalVisible} animationType="slide" onRequestClose={resetPhotoState}>
        {!capturedPhoto ? (
          <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
            <View style={styles.cameraButtonContainer}>
              <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraFacing}>
                <Text style={styles.cameraButtonText}>Virar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
                <Text style={styles.cameraButtonText}>Tirar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cameraButton} onPress={resetPhotoState}>
                <Text style={styles.cameraButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        ) : (
          <SafeAreaView style={styles.formContainer}>
            <Image source={{ uri: capturedPhoto.uri }} style={styles.preview} />
            <TextInput
              style={styles.input}
              placeholder="Título da Foto"
              value={photoTitle}
              onChangeText={setPhotoTitle}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Descrição (opcional)"
              value={photoDescription}
              onChangeText={setPhotoDescription}
              multiline
            />
            <View style={styles.formButtonGroup}>
              <Button title="Salvar Foto" onPress={handleAddPhoto} />
              <Button title="Tirar Outra" color="#555" onPress={() => setCapturedPhoto(null)} />
            </View>
            <Button title="Cancelar" color="red" onPress={resetPhotoState} />
          </SafeAreaView>
        )}
      </Modal>

      <Modal visible={editModalVisible} animationType="slide" onRequestClose={resetPhotoState}>
        <SafeAreaView style={styles.formContainer}>
          <Text style={styles.modalTitle}>Editar Foto</Text>
          {currentPhoto?.uri && <Image source={{ uri: currentPhoto.uri }} style={styles.preview} />}
          <TextInput
            style={styles.input}
            placeholder="Título da Foto"
            value={photoTitle}
            onChangeText={setPhotoTitle}
          />
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Descrição"
            value={photoDescription}
            onChangeText={setPhotoDescription}
            multiline
          />
          <View style={styles.formButtonGroup}>
            <Button title="Salvar Alterações" onPress={handleUpdatePhoto} />
            <Button title="Cancelar" color="red" onPress={resetPhotoState} />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f7',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  list: {
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photo: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 15,
  },
  photoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  photoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  photoDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 30,
    bottom: 30,
    backgroundColor: '#007bff',
    borderRadius: 30,
    elevation: 8,
    zIndex: 10,
  },
  fabIcon: {
    fontSize: 30,
    color: 'white',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  camera: {
    flex: 1,
  },
  cameraButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  cameraButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 10,
  },
  cameraButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  preview: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  formButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  }
});