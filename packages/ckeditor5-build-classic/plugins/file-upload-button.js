import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';

export default class FileUploadButton extends Plugin {
  init() {
    const editor = this.editor;

    // Add the upload button to the toolbar
    editor.ui.componentFactory.add('fileUpload', (locale) => {
      const buttonView = new ButtonView(locale);

      buttonView.set({
        label: 'Upload file',
        icon: '<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 12V3.707l-2.146 2.147a.5.5 0 0 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L9.5 3.707V12a.5.5 0 0 1-1 0z"/><path d="M3 15a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2a.5.5 0 0 1 1 0v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-2a.5.5 0 0 1 1 0v2z"/></svg>',
        tooltip: 'Upload file from computer'
      });

      // Create hidden file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.style.display = 'none';
      fileInput.multiple = true; // Allow multiple file selection

      // Append to body temporarily
      document.body.appendChild(fileInput);

      // Handle button click
      buttonView.on('execute', () => {
        fileInput.click();
      });

      // Handle file selection
      fileInput.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) {
          return;
        }

        console.log('🎬 FileUploadButton - Files selected:', files.map(f => f.name));

        // Get the file repository
        const fileRepository = editor.plugins.get(FileRepository);
        
        // Process each selected file
        files.forEach((file) => {
          const loader = fileRepository.createLoader(file);

          if (!loader) {
            console.error('🎬 FileUploadButton - Could not create loader for file:', file.name);
            return;
          }

          console.log('🎬 FileUploadButton - Uploading file:', file.name);

          // Upload the file
          loader.upload().then((result) => {
            console.log('🎬 FileUploadButton - Upload result:', result);

            editor.model.change((writer) => {
              // Check if it's a video file
              const isVideo = this.isVideoFile(file.name);
              
              if (isVideo && result.default) {
                // For video files, use the media embed approach
                console.log('🎬 FileUploadButton - Inserting video via mediaEmbed');
                
                // Try to use the mediaEmbed command if available
                if (editor.commands.get('mediaEmbed')) {
                  editor.execute('mediaEmbed', result.default);
                } else {
                  // Fallback: insert as link
                  const linkNode = writer.createText(result.text || file.name, {
                    linkHref: result.default,
                  });
                  editor.model.insertContent(linkNode);
                }
              } else {
                // For non-video files, insert as a link
                const linkNode = writer.createText(result.text || file.name, {
                  linkHref: result.default,
                });
                
                const position = editor.model.document.selection.getFirstPosition();
                editor.model.insertContent(linkNode, position);

                // Add space after the link
                const emptySpace = writer.createText(' ');
                editor.model.insertContent(emptySpace, writer.createPositionAfter(linkNode));
                writer.setSelection(writer.createPositionAfter(emptySpace));
              }
            });
          }).catch((error) => {
            console.error('🎬 FileUploadButton - Upload failed:', error);
          });
        });

        // Reset file input
        fileInput.value = '';
      });

      // Clean up when editor is destroyed
      editor.on('destroy', () => {
        if (fileInput.parentNode) {
          fileInput.parentNode.removeChild(fileInput);
        }
      });

      return buttonView;
    });
  }

  /**
   * Check if a file is a video file based on extension
   */
  isVideoFile(filename) {
    if (!filename) return false;
    
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'm4v'];
    const extension = filename.split('.').pop().toLowerCase();
    return videoExtensions.includes(extension);
  }
}