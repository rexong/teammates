import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TINYMCE_BASE_URL } from './tinymce';

const RICH_TEXT_EDITOR_MAX_CHARACTER_LENGTH = 2000;

/**
 * A rich text editor.
 */
@Component({
  selector: 'tm-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
})
export class RichTextEditorComponent implements OnInit {

  // const
  RICH_TEXT_EDITOR_MAX_CHARACTER_LENGTH: number = RICH_TEXT_EDITOR_MAX_CHARACTER_LENGTH;

  @Input()
  isDisabled: boolean = false;

  @Input()
  hasCharacterLimit: boolean = false;

  @Input()
  minHeightInPx: number = 150;

  @Input()
  placeholderText: string = '';

  @Input()
  richText: string = '';

  @Output()
  richTextChange: EventEmitter<string> = new EventEmitter();

  characterCount: number = 0;

  // the argument passed to tinymce.init() in native JavaScript
  init: any = {};

  render: boolean = false;

  defaultToolbar: string = 'styles | forecolor backcolor '
      + '| bold italic underline strikethrough subscript superscript '
      + '| alignleft aligncenter alignright alignjustify '
      + '| bullist numlist | link image charmap emoticons';

  ngOnInit(): void {
    this.init = this.getEditorSettings();
  }

  private getEditorSettings(): any {
    return {
      base_url: TINYMCE_BASE_URL,
      skin_url: `${TINYMCE_BASE_URL}/skins/ui/oxide`,
      content_css: '/assets/tinymce/tinymce.css',
      suffix: '.min',
      height: this.minHeightInPx,
      resize: true,
      inline: false,
      relative_urls: false,
      convert_urls: false,
      remove_linebreaks: false,
      placeholder: this.placeholderText,
      plugins: [
        'advlist', 'autolink', 'autoresize', 'lists', 'link', 'image', 'charmap', 'anchor',
        'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code',
        'insertdatetime', 'nonbreaking', 'save', 'table', 'directionality',
        'emoticons',
      ],
      menubar: false,
      autoresize_bottom_margin: 50,

      toolbar1: this.defaultToolbar,
      setup: (editor:any) => {
        if (this.hasCharacterLimit) {
          editor.on('GetContent', () => {
            setTimeout(() => {
              this.characterCount = this.getCurrentCharacterCount(editor);
            }, 0);
          });
          editor.on('keypress', (event:any) => {
            const currentCharacterCount = this.getCurrentCharacterCount(editor);
            if (currentCharacterCount >= RICH_TEXT_EDITOR_MAX_CHARACTER_LENGTH) {
              event.preventDefault();
            }
          });
          editor.on('paste', (event: any) => {
            setTimeout(() => {
              const currentCharacterCount = this.getCurrentCharacterCount(editor);
              if (currentCharacterCount >= RICH_TEXT_EDITOR_MAX_CHARACTER_LENGTH) {
                event.preventDefault();
                const currentContent = editor.getContent({ format: 'text' });
                const limitContent = currentContent.substring(0, RICH_TEXT_EDITOR_MAX_CHARACTER_LENGTH);
                editor.setContent(limitContent);

                // This sets the cursor to the end of the text.
                editor.selection.select(editor.getBody(), true);
                editor.selection.collapse(false);
              }
            }, 0);
          });
        }
      },
    };
  }

  getCurrentCharacterCount(editor: any): number {
    const wordCountApi = editor.plugins.wordcount;
    const currentCharacterCount = wordCountApi.body.getCharacterCount();
    return currentCharacterCount;
  }

  renderEditor(event: any): void {
    // If the editor has not been rendered before, render it once it gets into the viewport
    // However, do not destroy it when it gets out of the viewport
    if (event.visible) {
      this.render = true;
    }
  }

}
