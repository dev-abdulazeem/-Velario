import bcrypt from 'bcryptjs';

const password = 'admin123'; // Change this to whatever password you want
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);

console.log('Password:', password);
console.log('Hash:', hash);