import React from 'react';
import { SafeAreaView, Image, TextInput, TouchableOpacity, StyleSheet, Text, View, Modal, Platform } from 'react-native';

export default function EditModal({ visible, onClose, currentPhoto, photoTitle, setPhotoTitle, photoDescription, setPhotoDescription, onSave }) {
  if (!visible) return null;

  return (
    // Usando o componente Modal nativo para um controle de tela cheia melhor
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.modalTitle}>Editar Foto</Text>
        
        {currentPhoto?.uri && 
          <Image 
            source={{ uri: currentPhoto.uri }} 
            style={styles.preview} 
          />
        }
        
        <TextInput 
          style={styles.input} 
          placeholder="Título da Foto" 
          value={photoTitle} 
          onChangeText={setPhotoTitle} 
          maxLength={50}
        />
        
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Descrição (opcional)" 
          value={photoDescription} 
          onChangeText={setPhotoDescription} 
          multiline 
          numberOfLines={4}
          maxLength={200}
          textAlignVertical="top" // Para Android, alinha o texto ao topo
        />
        
        <View style={styles.formButtonGroup}>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={onSave} disabled={!photoTitle}>
            <Text style={styles.buttonText}>Salvar Alterações</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25, // Aumento do padding para um visual mais arejado
    backgroundColor: '#f9f9f9', // Fundo levemente off-white
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },

  modalTitle: {
    fontSize: 28, // Título maior
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 30,
    color: '#1a1a1a',
  },

  preview: {
    width: '100%',
    height: 200, // Ajustado para ser mais compacto
    resizeMode: 'cover',
    marginBottom: 30,
    borderRadius: 12, // Bordas suaves
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
    height: 100, // Altura maior para a descrição
    paddingTop: 15,
  },

  formButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  
  saveButton: {
    backgroundColor: '#4CAF50', // Cor de sucesso (verde)
  },
  
  cancelButton: {
    backgroundColor: '#e53e3e', // Cor de cancelamento (vermelho)
  },
  
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});