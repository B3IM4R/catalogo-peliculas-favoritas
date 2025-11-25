import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Definimos el esquema del usuario
const userSchema = new mongoose.Schema(
  {
    // Campo: nombre del usuario
    name: {
      type: String,             
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre no puede exceder 50 caracteres']
    },
    
    // Campo: correo electrónico (será único, no puede repetirse)
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      // Expresión regular para validar formato de email
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingresa un email válido'
      ]
    },
    
    // Campo: contraseña
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false
    }
  },
  {
    // Agrega automáticamente createdAt y updatedAt
    timestamps: true
  }
);

userSchema.pre('save', async function(next) {
  // Si la contraseña no fue modificada, continúa sin hacer nada
  if (!this.isModified('password')) {
    return next();
  }
  
  // Generamos un "salt" (semilla aleatoria) con 10 rondas de encriptación
  const salt = await bcrypt.genSalt(10);
  
  // Encriptamos la contraseña con el salt
  this.password = await bcrypt.hash(this.password, salt);
  
  next();
});

// Método para comparar contraseñas (login)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Creamos el modelo a partir del esquema
const User = mongoose.model('User', userSchema);

export default User;