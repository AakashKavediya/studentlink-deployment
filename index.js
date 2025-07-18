require('dotenv').config(); // must be at the very top

//External Libraries
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const router = express.Router();
//Internal code
const connectDB = require ('./mongoose/mongooseConnection')
const users = require('./mongoose/mongooseSignupSchema')
const products = require('./mongoose/productSchema')
const Comment = require('./mongoose/commentSchema')
const events = require('./mongoose/eventSchema')
const { initGridFS, getGFS } = require('./gridfs');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const mongoose = require('mongoose');

//Variables
const PORT = process.env.PORT || 5000



//Initialization
const app = express();
initGridFS();

//Connecting to the cloud Database
connectDB()

// Make uploads folder publicly accessible
app.use('/uploads', express.static('uploads'));

//middel ware
app.use(express.json())
app.use(cors())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Sign up code
app.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, emailID, password } = req.body;

    const hashpassword = await bcrypt.hash(password, 6);
    console.log("Hashed Password = ", hashpassword);

    // Check if user already exists
    const existingUser = await users.findOne({ emailID: emailID });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    // Create new user
    const newUser = await users.create({
      firstName,
      lastName,
      emailID,
      password: hashpassword
    });

    res.status(201).send({
      message: "User signed up successfully",
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        emailID: newUser.emailID
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Internal server error");
  }
});
app.post('/signin', async (req, res) => {
  console.time("signin"); // ✅ Start timing here

  try {
    const { emailID, password } = req.body;

    if (!emailID || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await users.findOne({ emailID });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ 
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.emailID,
        name: user.name
      }
    });

  } catch (e) {
    console.error("Sign in Error:", e);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    console.timeEnd("signin"); // ✅ End timing here no matter what
  }
});


// app.get('/myProfile', async(req,res)=>{
//   const emailID = req.body
//   const myProfile = await users.find(emailID)
//   res.send(myProfile)
//   console.log(emailID)
// })

// GET endpoint to fetch user profile
// GET endpoint to fetch user profile
app.get('/myProfile', async (req, res) => {
  try {
    const allUsers = await users.find({}, { password: 0 }); // Exclude password if stored

    res.json({
      success: true,
      message: 'All user profiles retrieved successfully',
      users: allUsers
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});


app.post('/myProfile', async (req, res) => {
    try {
        const { emailID } = req.body; // Now getting emailID from request body
        
        if (!emailID) {
            return res.status(400).json({ 
                success: false,
                message: 'Email is required in request body { "emailID": "user@example.com" }' 
            });
        }

        const user = await users.findOne({ emailID: emailID });
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        const userData = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            emailID: user.emailID
        };

        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            user: userData
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: error.message 
        });
    }
});





app.post('/products', async (req, res) => {
  try {
    const { heading, price, condition, description, category,userName,image } = req.body;

    const newProduct = new products({
      userName,
      heading,
      price,
      condition,
      description,
      category,
      image,
      // ownerEmail,
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: 'Product created successfully!',
      product: savedProduct
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error while creating product.' });
  }
});

// Add this to your backend (Node.js/Express)
app.get('/products', async (req, res) => {
  try {
    const allProducts = await products.find(); // Assuming you're using Mongoose
    res.status(200).json(allProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});



app.post('/products/:productId/comments', async (req, res) => {
  const { productId } = req.params;
  const { comment, userName,emailID } = req.body;
  
  console.log("🔥 Incoming comment payload:", { productId, comment, userName });

  try {
    const newComment = await Comment.create({
      productId,
      text: comment,
      userName: userName,
      emailID:emailID,
      createdAt: new Date()
    });

    console.log("✅ Saved comment:", newComment);

    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    console.error("❌ Error saving comment:", err);
    res.status(500).json({ success: false, message: 'Failed to post comment' });
  }
});
app.get('/products/:productId/comments', async (req, res) => {
  const { productId } = req.params;

  try {
    const comments = await Comment.find({ productId }).sort({ createdAt: 1 }); // oldest first
    res.status(200).json({ success: true, comments }); // ✅ must return { success, comments }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});




// // Multer Configuration for File Upload
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `event_${Date.now()}${path.extname(file.originalname)}`);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only image files are allowed!'), false);
//   }
// };

// const upload = multer({ 
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 1024 * 1024 * 5 // 5MB limit
//   }
// });

// // Routes
// app.post('/events', upload.single('image'), async (req, res) => {
//   try {
//     // Validate required fields
//     const { heading, description, name } = req.body;
    
//     if (!heading || !description || !name) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Heading, description, and name are required' 
//       });
//     }

//     if (!req.file) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Image is required' 
//       });
//     }

//     // Create new event
//     const newEvent = await events.create({
//       heading,
//       description,
//       name,
//       image: `/uploads/${req.file.filename}`
//     });

//     res.status(201).json({ 
//       success: true,
//       message: 'Event created successfully',
//       event: newEvent
//     });
//   } catch (error) {
//     console.error('Error creating event:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Server error occurred' 
//     });
//   }
// });

// // Get all events
// app.get('/events', async (req, res) => {
//   try {
//     const allEvents = await events.find().sort({ createdAt: -1 });
//     res.json({ success: true, events: allEvents });
//   } catch (error) {
//     console.error('Error fetching events:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch events' 
//     });
//   }
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     success: false, 
//     message: err.message || 'Something broke!' 
//   });
// });


const storage = multer.memoryStorage(); // Stores file as Buffer in memory

// Define fileFilter before using it
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB limit
  }
});


// GridFS-based POST /events route
app.post('/events', upload.single('image'), async (req, res) => {
  try {
    const { heading, description, name } = req.body;
    if (!heading || !description || !name || !req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Create a write stream to GridFS
    const gfs = getGFS();
    const writeStream = gfs.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    });

    writeStream.end(req.file.buffer);

    writeStream.on('finish', async (file) => {
      // Create the event with reference to the GridFS file
      const newEvent = await events.create({
        heading,
        description,
        name,
        imageId: file._id
      });

      res.status(201).json({ 
        success: true,
        message: 'Event created successfully',
        event: newEvent
      });
    });

    writeStream.on('error', (err) => {
      console.error('GridFS upload error:', err);
      res.status(500).json({ success: false, message: 'Image upload failed' });
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error occurred' 
    });
  }
});
app.get('/events', async (req, res) => {
  try {
    const allEvents = await events.find().toArray(); // if using native MongoDB
    res.json({ success: true, events: allEvents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Route to serve images from GridFS
app.get('/events/:id/image', async (req, res) => {
  try {
    const event = await events.findById(req.params.id);
    if (!event || !event.imageId) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    const gfs = getGFS();
    const readStream = gfs.openDownloadStream(event.imageId);
    readStream.on('error', (err) => {
      console.error('GridFS read error:', err);
      res.status(404).json({ success: false, message: 'Image not found' });
    });
    readStream.pipe(res);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error occurred' 
    });
  }
});

//Express Server
app.listen(PORT, ()=>{
  console.log("Backend Server Started")
})