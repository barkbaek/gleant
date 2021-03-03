/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

( function() {
	function noBlockLeft( bqBlock ) {
		for ( var i = 0, length = bqBlock.getChildCount(), child; i < length && ( child = bqBlock.getChild( i ) ); i++ ) {
			if ( child.type == CKEDITOR.NODE_ELEMENT && child.isBlockBoundary() )
				return false;
		}
		return true;
	}

	var commandObject = {
		exec: function( editor ) {
			var state = editor.getCommand( 'insertblockquote2' ).state,
				selection = editor.getSelection(),
				range = selection && selection.getRanges()[ 0 ];
			if ( !range ) {
                return;
			}

			var bookmarks = selection.createBookmarks();
			// Kludge for #1592: if the bookmark nodes are in the beginning of
			// blockquote2, then move them to the nearest block element in the
			// blockquote2.
			if ( CKEDITOR.env.ie ) {
				var bookmarkStart = bookmarks[ 0 ].startNode,
					bookmarkEnd = bookmarks[ 0 ].endNode,
					cursor;

				if ( bookmarkStart && bookmarkStart.getParent().getName() == 'blockquote2' ) {
					cursor = bookmarkStart;
					while ( ( cursor = cursor.getNext() ) ) {
						if ( cursor.type == CKEDITOR.NODE_ELEMENT && cursor.isBlockBoundary() ) {
							bookmarkStart.move( cursor, true );
							break;
						}
					}
				}

				if ( bookmarkEnd && bookmarkEnd.getParent().getName() == 'blockquote2' ) {
					cursor = bookmarkEnd;
					while ( ( cursor = cursor.getPrevious() ) ) {
						if ( cursor.type == CKEDITOR.NODE_ELEMENT && cursor.isBlockBoundary() ) {
							bookmarkEnd.move( cursor );
							break;
						}
					}
				}
			}

			var iterator = range.createIterator(),
				block;
			iterator.enlargeBr = editor.config.enterMode != CKEDITOR.ENTER_BR;
			if ( state == CKEDITOR.TRISTATE_OFF ) {
				var paragraphs = [];
				while ( ( block = iterator.getNextParagraph() ) ) {
                    paragraphs.push( block );
				}
				// If no paragraphs, create one from the current selection position.
				if ( paragraphs.length < 1 ) {
					var para = editor.document.createElement('div'),
						firstBookmark = bookmarks.shift();
					range.insertNode( para );
					para.append( new CKEDITOR.dom.text( '\ufeff', editor.document ) );
					range.moveToBookmark( firstBookmark );
					range.selectNodeContents( para );
					range.collapse( true );
					firstBookmark = range.createBookmark();
					paragraphs.push( para );
					bookmarks.unshift( firstBookmark );
				}

				// Make sure all paragraphs have the same parent.
				var commonParent = paragraphs[ 0 ].getParent(),
					tmp = [];
				for ( var i = 0; i < paragraphs.length; i++ ) {
					block = paragraphs[ i ];
					commonParent = commonParent.getCommonAncestor( block.getParent() );
				}

				// The common parent must not be the following tags: table, tbody, tr, ol, ul.
				var denyTags = { table: 1, tbody: 1, tr: 1, ol: 1, ul: 1 };
				while ( denyTags[ commonParent.getName() ] ) {
                    commonParent = commonParent.getParent();
				}


				// Reconstruct the block list to be processed such that all resulting blocks
				// satisfy parentNode.equals( commonParent ).
				var lastBlock = null;
				while ( paragraphs.length > 0 ) {
					block = paragraphs.shift();
					while ( !block.getParent().equals( commonParent ) )
						block = block.getParent();
					if ( !block.equals( lastBlock ) )
						tmp.push( block );
					lastBlock = block;
				}

				// If any of the selected blocks is a blockquote2, remove it to prevent
				// nested blockquote2s.
				while ( tmp.length > 0 ) {
					block = tmp.shift();
					if ( block.getName() == 'blockquote' ) {
						var docFrag = new CKEDITOR.dom.documentFragment( editor.document );
						while ( block.getFirst() ) {
							docFrag.append( block.getFirst().remove() );
							paragraphs.push( docFrag.getLast() );
						}
						docFrag.replace( block );
					} else {
						paragraphs.push( block );
					}
				}

				// Now we have all the blocks to be included in a new blockquote2 node.
				var bqBlock = editor.document.createElement( 'blockquote' );
				bqBlock.insertBefore( paragraphs[ 0 ] );
				while ( paragraphs.length > 0 ) {
					block = paragraphs.shift();
					bqBlock.append( block );
				}
			} else if ( state == CKEDITOR.TRISTATE_ON ) {
				var moveOutNodes = [],
					database = {};

				while ( ( block = iterator.getNextParagraph() ) ) {
					var bqParent = null,
						bqChild = null;
					while ( block.getParent() ) {
						if ( block.getParent().getName() == 'blockquote2' ) {
							bqParent = block.getParent();
							bqChild = block;
							break;
						}
						block = block.getParent();
					}

					// Remember the blocks that were recorded down in the moveOutNodes array
					// to prevent duplicates.
					if ( bqParent && bqChild && !bqChild.getCustomData( 'blockquote2_moveout' ) ) {
						moveOutNodes.push( bqChild );
						CKEDITOR.dom.element.setMarker( database, bqChild, 'blockquote2_moveout', true );
					}
				}

				CKEDITOR.dom.element.clearAllMarkers( database );

				var movedNodes = [],
					processedblockquote2Blocks = [];

				database = {};
				while ( moveOutNodes.length > 0 ) {
					var node = moveOutNodes.shift();
					bqBlock = node.getParent();

					// If the node is located at the beginning or the end, just take it out
					// without splitting. Otherwise, split the blockquote2 node and move the
					// paragraph in between the two blockquote2 nodes.
					if ( !node.getPrevious() ) {
                        node.remove().insertBefore( bqBlock );
					} else if ( !node.getNext() ) {
                        node.remove().insertAfter( bqBlock );
					} else {
						node.breakParent( node.getParent() );
						processedblockquote2Blocks.push( node.getNext() );
					}

					// Remember the blockquote22 node so we can clear it later (if it becomes empty).
					if ( !bqBlock.getCustomData( 'blockquote2_processed' ) ) {
						processedblockquote2Blocks.push( bqBlock );
						CKEDITOR.dom.element.setMarker( database, bqBlock, 'blockquote2_processed', true );
					}
					movedNodes.push( node );
				}

				CKEDITOR.dom.element.clearAllMarkers( database );

				// Clear blockquote2 nodes that have become empty.
				for ( i = processedblockquote2Blocks.length - 1; i >= 0; i-- ) {
					bqBlock = processedblockquote2Blocks[ i ];
					if ( noBlockLeft( bqBlock ) ) {
                        bqBlock.remove();
					}

				}

				if ( editor.config.enterMode == CKEDITOR.ENTER_BR ) {
					var firstTime = true;
					while ( movedNodes.length ) {
						node = movedNodes.shift();
						if ( node.getName() == 'div' ) {
							docFrag = new CKEDITOR.dom.documentFragment( editor.document );

							var needBeginBr = firstTime && node.getPrevious() && !( node.getPrevious().type == CKEDITOR.NODE_ELEMENT && node.getPrevious().isBlockBoundary() );
							if ( needBeginBr ) {
                                docFrag.append( editor.document.createElement( 'br' ) );
							}
							var needEndBr = node.getNext() && !( node.getNext().type == CKEDITOR.NODE_ELEMENT && node.getNext().isBlockBoundary() );
							while ( node.getFirst() ) {
                                node.getFirst().remove().appendTo( docFrag );
							}
							if ( needEndBr ) {
                                docFrag.append( editor.document.createElement( 'br' ) );
							}

							docFrag.replace( node );
							firstTime = false;
						}
					}
				}
			}

			selection.selectBookmarks( bookmarks );
			editor.focus();
		}
	};

	CKEDITOR.plugins.add( 'blockquote2', {
		icons: 'blockquote2', // %REMOVE_LINE_CORE%
		init: function( editor ) {
			editor.addCommand( 'insertblockquote2', commandObject );
			editor.ui.addButton( 'blockquote2', {
				label: '인용 문구',
				command: 'insertblockquote2',
				toolbar: 'basicstyles'
			} );
		}
	} );
} )();
