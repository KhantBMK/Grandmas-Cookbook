const {uploadImage} = require('../services/cloudinary');

const upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({error: 'No file provided'})
        }

        const image_url = await uploadImage(req.file.buffer);
        res.json({image_url});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Failed to upload image'});
    }
};

module.exports = {upload};