import './style.css'

const File = ({ sl, name, size, progress }) => {
    const length = 20;
    const trimmedFilename = name.length > length ? 
        name.substring(0, length - 3) + "..." : 
        name;

    const formatFileSize = bytes => {
        const sizes = ['B', 'Kb', 'Mb', 'Gb', 'Tb'];
        if (bytes === 0) return '0 Bytes';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)}${sizes[i]}`;
    }

    return (
        <tr className="file">
            <td>{ sl }.</td>
            <td>{ trimmedFilename }</td>
            <td>{ formatFileSize(size) }</td>
            <td>{ progress }</td>
        </tr>
    )
}

export default File