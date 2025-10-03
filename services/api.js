const API_URL = 'http://10.110.12.41:3000/photos';

export const fetchPhotos = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Erro ao buscar fotos");
  return res.json();
};

export const addPhoto = async (photo) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(photo),
  });
  if (!res.ok) throw new Error("Erro ao adicionar foto");
  return res.json();
};

export const updatePhoto = async (photo) => {
  const res = await fetch(`${API_URL}/${photo.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(photo),
  });
  if (!res.ok) throw new Error("Erro ao atualizar foto");
  return res.json();
};

export const deletePhoto = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error("Erro ao deletar foto");
  return res.json();
};
