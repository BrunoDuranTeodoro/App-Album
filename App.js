import React, { useState, useEffect, useRef } from 'react';
import { FlatList, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';


import PhotoCard from './components/PhotoCard';
import CameraModal from './components/CameraModal';
import EditModal from './components/EditModal';
import * as api from './services/api';


export default function App() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [facing, setFacing] = useState('back');
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoDescription, setPhotoDescription] = useState('');


  //apos renderizaçao pede permisssao e busca as fotos
  useEffect(() => {
    fetchAllPhotos();
    requestCameraPermission();
  }, []);

  const fetchAllPhotos = async () => {
    try {
      setLoading(true);
      const data = await api.fetchPhotos();
      setPhotos(data.reverse());
    } catch (error) {
      console.error('Erro ao buscar fotos:', error);
      alert('Não foi possível carregar as fotos. Verifique o servidor e o IP.');
    } finally {
      setLoading(false);
    }
  };

  const resetPhotoState = () => {
    setCameraModalVisible(false);
    setEditModalVisible(false);
    setCapturedPhoto(null);
    setCurrentPhoto(null);
    setPhotoTitle('');
    setPhotoDescription('');
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleAddPhoto = async () => {
    if (!capturedPhoto || !photoTitle) return alert('Você precisa de uma foto e um título.');
    const newPhoto = {
      titulo_foto: photoTitle,
      descricao_foto: photoDescription,
      data_foto: new Date().toISOString(),
      uri: capturedPhoto.uri,
    };
    try {
      await api.addPhoto(newPhoto);
      resetPhotoState();
      fetchAllPhotos();
    } catch (error) {
      console.error('Erro ao adicionar foto:', error);
      alert('Não foi possível salvar a foto.');
    }
  };

  const handleUpdatePhoto = async () => {
    if (!currentPhoto || !photoTitle) return alert('O título não pode ficar em branco.');
    const updatedPhoto = { ...currentPhoto, titulo_foto: photoTitle, descricao_foto: photoDescription };
    try {
      await api.updatePhoto(updatedPhoto);
      resetPhotoState();
      fetchAllPhotos();
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      alert('Não foi possível atualizar a foto.');
    }
  };

  const handleDeletePhoto = async (id) => {
    try {
      await api.deletePhoto(id);
      fetchAllPhotos();
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      alert('Não foi possível deletar a foto.');
    }
  };

  const openEditModal = (photo) => {
    setCurrentPhoto(photo);
    setPhotoTitle(photo.titulo_foto);
    setPhotoDescription(photo.descricao_foto);
    setEditModalVisible(true);
  };

  if (!cameraPermission) return null;

  if (!cameraPermission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={{ textAlign: 'center', marginBottom: 20, color: '#333' }}>
          Precisamos de permissão para usar a câmera.
        </Text>
        <TouchableOpacity onPress={requestCameraPermission} style={styles.permissionButton}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Conceder Permissão</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>App Álbum</Text>

      <TouchableOpacity style={styles.fab} onPress={() => setCameraModalVisible(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {loading && photos.length === 0 ? (
        <ActivityIndicator size="large" color="#FF6B6B" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={photos}
          renderItem={({ item }) => (
            <PhotoCard photo={item} onEdit={openEditModal} onDelete={handleDeletePhoto} />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          onRefresh={fetchAllPhotos}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>Nenhuma foto encontrada. Adicione a primeira!</Text>
          }
        />
      )}

      <CameraModal
        visible={cameraModalVisible}
        onClose={resetPhotoState}
        cameraRef={cameraRef}
        facing={facing}
        toggleFacing={toggleCameraFacing}
        capturedPhoto={capturedPhoto}
        setCapturedPhoto={setCapturedPhoto}
        photoTitle={photoTitle}
        setPhotoTitle={setPhotoTitle}
        photoDescription={photoDescription}
        setPhotoDescription={setPhotoDescription}
        onSave={handleAddPhoto}
      />

      <EditModal
        visible={editModalVisible}
        onClose={resetPhotoState}
        currentPhoto={currentPhoto}
        photoTitle={photoTitle}
        setPhotoTitle={setPhotoTitle}
        photoDescription={photoDescription}
        setPhotoDescription={setPhotoDescription}
        onSave={handleUpdatePhoto}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: Platform.OS === 'android' ? 0 : 0,
  },

  header: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'left',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    color: '#1a1a1a',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
      },
    }),
  },

  list: {
    paddingHorizontal: 15,
    paddingBottom: 100,
    paddingTop: 5,
  },

  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },

  fab: {
    position: 'absolute',
    width: 65,
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
    right: 25,
    bottom: 30,
    backgroundColor: '#FF6B6B', // Coral vibrante
    borderRadius: 35,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 10,
  },

  fabIcon: {
    fontSize: 35,
    fontWeight: '300',
    lineHeight: 35,
    color: 'white',
  },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
  },

  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});