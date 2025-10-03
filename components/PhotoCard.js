import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function PhotoCard({ photo, onEdit, onDelete }) {
  // Função para formatar a data de forma mais amigável
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).replace('.', ''); // Remove o ponto após o mês
    } catch {
      return 'Data Inválida';
    }
  };

  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: photo.uri }} 
        style={styles.photo} 
        // Linha defaultSource removida para evitar o erro de bundling.
      />
      
      <View style={styles.cardContent}>
        <Text style={styles.photoTitle} numberOfLines={1}>
          {photo.titulo_foto}
        </Text>
        
        {photo.descricao_foto ? (
          <Text style={styles.photoDescription} numberOfLines={2}>
            {photo.descricao_foto}
          </Text>
        ) : null}
        
        <Text style={styles.photoDate}>
          Adicionada em {formatDate(photo.data_foto)}
        </Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.editButton} onPress={() => onEdit(photo)}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => onDelete(photo.id)}
          >
            <Text style={styles.deleteButtonText}>Deletar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },

  photo: {
    width: '100%',
    height: 220,
    backgroundColor: '#e0e0e0',
  },

  cardContent: {
    padding: 15,
  },

  photoTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
    color: '#1a1a1a',
  },

  photoDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },

  photoDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },

  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    gap: 10,
  },
  
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#007bff',
    borderRadius: 6,
  },
  
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#e53e3e',
    borderRadius: 6,
  },

  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});