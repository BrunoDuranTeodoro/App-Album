import React from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, SafeAreaView, StyleSheet, Modal, Platform } from 'react-native';
import { CameraView } from 'expo-camera';

export default function CameraModal({ visible, onClose, cameraRef, facing, toggleFacing, capturedPhoto, setCapturedPhoto, photoTitle, setPhotoTitle, photoDescription, setPhotoDescription, onSave }) {
  if (!visible) return null;

  // Função unificada para fechar e resetar o estado
  const handleCancel = () => {
    setCapturedPhoto(null);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={handleCancel}
    >
      <SafeAreaView style={styles.container}>
        {!capturedPhoto ? (
          // --- MODO CÂMERA ---
          <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
            <View style={styles.cameraControlsTop}>
              <TouchableOpacity style={styles.closeCamera} onPress={handleCancel}>
                <Text style={styles.closeCameraText}>X</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.flipButton} onPress={toggleFacing}>
                <Text style={styles.flipButtonText}>🔄 Virar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cameraControlsBottom}>
              <TouchableOpacity 
                style={styles.captureButton} 
                onPress={() => cameraRef.current.takePictureAsync().then(setCapturedPhoto)}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </CameraView>
        ) : (
          // --- MODO PRÉVIA E SALVAMENTO (FORMULÁRIO) ---
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Salvar Foto</Text>
            
            <Image source={{ uri: capturedPhoto.uri }} style={styles.preview} />
            
            <TextInput 
              placeholder="Título da Foto" 
              value={photoTitle} 
              onChangeText={setPhotoTitle} 
              style={styles.input} 
              maxLength={50}
            />
            <TextInput 
              placeholder="Descrição (opcional)" 
              value={photoDescription} 
              onChangeText={setPhotoDescription} 
              style={[styles.input, styles.textArea]} 
              multiline 
              numberOfLines={4}
              maxLength={200}
              textAlignVertical="top"
            />
            
            <View style={styles.formButtonGroup}>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={onSave} disabled={!photoTitle}>
                <Text style={styles.buttonText}>Salvar Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.retakeButton]} onPress={() => setCapturedPhoto(null)}>
                <Text style={styles.buttonText}>Tirar Outra</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.cancelFormButton} onPress={handleCancel}>
              <Text style={styles.cancelFormButtonText}>Cancelar e Sair</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9', // Fundo levemente off-white
  },

  // ------------------------------------------------------------------
  // ESTILOS DO MODO CÂMERA
  // ------------------------------------------------------------------
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  cameraControlsTop: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 0, // Ajuste para Android
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },

  closeCamera: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  closeCameraText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },

  flipButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },

  cameraControlsBottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },

  // ------------------------------------------------------------------
  // ESTILOS DO MODO FORMULÁRIO (PRÉVIA)
  // ------------------------------------------------------------------
  formContainer: {
    flex: 1,
    padding: 25,
    paddingTop: 30,
    backgroundColor: '#f9f9f9',
  },

  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1a1a1a',
  },

  preview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 30,
    borderRadius: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  textArea: {
    height: 100,
    paddingTop: 15,
  },

  formButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 15,
  },

  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  
  saveButton: {
    backgroundColor: '#FF6B6B', // Cor principal do FAB (Coral)
  },
  
  retakeButton: {
    backgroundColor: '#555', // Cor cinza para a ação secundária
  },
  
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  cancelFormButton: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  
  cancelFormButtonText: {
    color: '#e53e3e',
    fontWeight: '600',
    fontSize: 14,
  }
});