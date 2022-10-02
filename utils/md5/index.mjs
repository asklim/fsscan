import MD5 from 'md5.js';

export default function hashMD5 (input) {
    return new MD5().update( input ).digest('hex');
}