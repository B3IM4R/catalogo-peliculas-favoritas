import mongoose from 'mongoose';

// Definimos el esquema de película
const movieSchema = new mongoose.Schema(
  {
    // Campo: ID del usuario dueño de esta película
    // Cada película pertenece a un usuario (relación)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Campo: título de la película
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      maxlength: [200, 'El título no puede exceder 200 caracteres']
    },
    
    // Campo: año de estreno
    year: {
      type: Number,
      required: [true, 'El año es obligatorio'],
      min: [1888, 'El año no puede ser menor a 1888'],
      max: [new Date().getFullYear() + 5, 'El año no puede ser tan futuro']
    },
    
    // Campo: director
    director: {
      type: String,
      required: [true, 'El director es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre del director no puede exceder 100 caracteres']
    },
    
    // Campo: género (puede ser uno o más géneros)
    genre: {
      type: String,
      required: [true, 'El género es obligatorio'],
      trim: true
    },
    
    // Campo: URL del póster (obtenido de OMDb API)
    poster: {
      type: String,
      required: [true, 'El póster es obligatorio'],
      default: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450"%3E%3Crect fill="%23e5e7eb" width="300" height="450"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="%236b7280"%3ESin Póster%3C/text%3E%3C/svg%3E'
    },
    
    // Campo: ID de la película en IMDb (opcional, si viene de OMDb)
    imdbID: {
      type: String,
      trim: true
    },
    
    // Campo: sinopsis o descripción (opcional)
    plot: {
      type: String,
      trim: true,
      maxlength: [1000, 'La sinopsis no puede exceder 1000 caracteres']
    }
  },
  {
    // Agrega createdAt y updatedAt automáticamente
    timestamps: true
  }
);

// Esto evita que un usuario agregue la misma película dos veces
movieSchema.index({ user: 1, title: 1, year: 1 }, { unique: true });

// Creamos el modelo
const Movie = mongoose.model('Movie', movieSchema);

export default Movie;